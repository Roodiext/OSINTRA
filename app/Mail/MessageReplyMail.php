<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MessageReplyMail extends Mailable
{
    use SerializesModels;

    public $messageId;
    public $subject;
    public $replyMessage;
    public $originalMessage;
    public $senderName;
    public $senderEmail;
    public $recipientName;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(Message $message)
    {
        $this->messageId = $message->id;
        $this->subject = $message->subject;
        $this->replyMessage = $message->reply_message;
        $this->originalMessage = $message->message;
        $this->recipientName = $message->name;
        $this->recipientEmail = $message->email;
        $this->senderName = $message->repliedBy?->name ?? 'Administrator';
        $this->senderEmail = $message->repliedBy?->email ?? config('mail.from.address');
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this
            ->from(config('mail.from.address', 'osisviskaa@gmail.com'), config('mail.from.name', 'OSIS'))
            ->subject('Balasan: ' . $this->subject)
            ->view('emails.message-reply')
            ->with([
                'subject' => $this->subject,
                'replyMessage' => $this->replyMessage,
                'originalMessage' => $this->originalMessage,
                'senderName' => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'recipientName' => $this->recipientName,
            ]);
    }
}
