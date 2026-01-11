<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MessageReplyMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(protected Message $message)
    {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $senderName = config('mail.from.name', 'OSVIS');
        
        return new Envelope(
            from: config('mail.from.address'),
            replyTo: config('mail.from.address'),
            subject: 'Balasan: ' . $this->message->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.message-reply',
            with: [
                'message' => $this->message,
                'recipientName' => $this->message->name,
                'senderName' => $this->message->repliedBy?->name ?? 'Administrator',
                'senderEmail' => $this->message->repliedBy?->email ?? config('mail.from.address'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
