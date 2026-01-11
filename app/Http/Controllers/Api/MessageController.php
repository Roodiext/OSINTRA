<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\MessageReplyMail;
use App\Models\Message;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    /**
     * Display a listing of messages.
     */
    public function index(Request $request)
    {
        $query = Message::query();

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        // Filter by reply status
        if ($request->has('reply_status')) {
            if ($request->reply_status === 'replied') {
                $query->whereNotNull('replied_at');
            } elseif ($request->reply_status === 'not_replied') {
                $query->whereNull('replied_at');
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->with('repliedBy:id,name,email')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($messages);
    }

    /**
     * Store a newly created message (from public form).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'category' => 'required|in:saran_program,kritik_feedback,laporan_masalah,ide_usulan,komplain',
            'priority' => 'required|in:low,normal,high',
            'is_anonymous' => 'boolean',
        ]);

        $message = Message::create($validated);

        AuditLog::log('create_message', "New message from: {$validated['name']} - Category: {$validated['category']}");

        return response()->json([
            'message' => 'Message sent successfully',
        ], 201);
    }

    /**
     * Display the specified message.
     */
    public function show(Message $message)
    {
        // Mark as read when viewed
        if ($message->status === 'unread') {
            $message->update(['status' => 'read']);
            AuditLog::log('read_message', "Read message from: {$message->name}");
        }

        return response()->json($message);
    }

    /**
     * Update the specified message status.
     */
    public function updateStatus(Request $request, Message $message)
    {
        $validated = $request->validate([
            'status' => 'required|in:unread,read,archived',
        ]);

        $message->update($validated);

        AuditLog::log('update_message_status', "Updated message status to: {$validated['status']}");

        return response()->json([
            'message' => $message,
            'message_text' => 'Message status updated successfully',
        ]);
    }

    /**
     * Remove the specified message.
     */
    public function destroy(Message $message)
    {
        $message->delete();

        AuditLog::log('delete_message', "Deleted message from: {$message->name}");

        return response()->json([
            'message' => 'Message deleted successfully',
        ]);
    }

    /**
     * Reply to a message.
     */
    public function reply(Request $request, Message $message)
    {
        $validated = $request->validate([
            'reply_message' => 'required|string',
        ]);

        // Load repliedBy relation before updating
        $message->load('repliedBy:id,name,email');

        $message->update([
            'reply_message' => $validated['reply_message'],
            'replied_at' => now(),
            'replied_by' => $request->user()->id,
        ]);

        // Send email to the message sender
        try {
            Mail::to($message->email)->send(new MessageReplyMail($message));
        } catch (\Exception $e) {
            // Log error but don't fail the reply operation
            \Log::error('Failed to send reply email: ' . $e->getMessage());
        }

        AuditLog::log('reply_message', "Replied to message from: {$message->name}");

        return response()->json([
            'message' => $message->load('repliedBy:id,name,email'),
            'message_text' => 'Reply sent successfully',
        ]);
    }

    /**
     * Get message statistics.
     */
    public function statistics()
    {
        $stats = [
            'total' => Message::count(),
            'unread' => Message::where('status', 'unread')->count(),
            'read' => Message::where('status', 'read')->count(),
            'archived' => Message::where('status', 'archived')->count(),
            'not_replied' => Message::whereNull('replied_at')->count(),
            'replied' => Message::whereNotNull('replied_at')->count(),
            'by_category' => Message::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->get(),
            'by_priority' => Message::selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->get(),
        ];

        return response()->json($stats);
    }
}
