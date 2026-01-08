<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::with('creator', 'approver');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by amount range
        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($transactions);
    }

    /**
     * Store a newly created transaction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'category' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'pending';

        $transaction = Transaction::create($validated);

        AuditLog::log('create_transaction', "Created {$transaction->type} transaction: {$transaction->title}");

        return response()->json([
            'transaction' => $transaction->load('creator'),
            'message' => 'Transaction created successfully',
        ], 201);
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load('creator'));
    }

    /**
     * Update the specified transaction.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:income,expense',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'category' => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);

        AuditLog::log('update_transaction', "Updated transaction: {$transaction->title}");

        return response()->json([
            'transaction' => $transaction->fresh()->load('creator', 'approver'),
            'message' => 'Transaction updated successfully',
        ]);
    }

    /**
     * Approve or reject a transaction.
     */
    public function approveTransaction(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $transaction->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);

        AuditLog::log(
            'approve_transaction',
            "Transaction {$validated['status']}: {$transaction->title} by {$request->user()->name}"
        );

        return response()->json([
            'transaction' => $transaction->fresh()->load('creator', 'approver'),
            'message' => "Transaction {$validated['status']} successfully",
        ]);
    }

    /**
     * Remove the specified transaction.
     */
    public function destroy(Transaction $transaction)
    {
        $title = $transaction->title;
        $transaction->delete();

        AuditLog::log('delete_transaction', "Deleted transaction: {$title}");

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }

    /**
     * Get transaction statistics and balance.
     */
    public function statistics(Request $request)
    {
        $query = Transaction::query();

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $income = (clone $query)->where('type', 'income')->sum('amount');
        $expense = (clone $query)->where('type', 'expense')->sum('amount');
        $balance = $income - $expense;

        $stats = [
            'total_income' => (float) $income,
            'total_expense' => (float) $expense,
            'balance' => (float) $balance,
            'transaction_count' => $query->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get monthly transaction data for charts.
     */
    public function monthlyData(Request $request)
    {
        $year = $request->get('year', date('Y'));

        $data = Transaction::select(
                DB::raw('MONTH(date) as month'),
                DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense')
            )
            ->whereYear('date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => $item->month,
                    'income' => (float) $item->income,
                    'expense' => (float) $item->expense,
                    'balance' => (float) ($item->income - $item->expense),
                ];
            });

        return response()->json($data);
    }
}
