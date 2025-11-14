<?php
namespace App\Jobs;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Log;
use Exception;

class AIReplyJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $messageId;
    public $tries = 3; // Retry 3 lần nếu fail

    public function __construct($messageId)
    {
        $this->messageId = $messageId;
    }

    public function handle()
    {
        try {
            $msg = Message::find($this->messageId);
            if (!$msg) {
                Log::warning("AIReplyJob: Message not found", ['message_id' => $this->messageId]);
                return;
            }

            $reply = $this->callAI($msg->content);

            $aiMessage = Message::create([
                'conversation_id' => $msg->conversation_id,
                'user_id' => null, // Bot message không có user_id
                'sender_type' => 'bot', // Enum chỉ cho phép: 'user', 'seller', 'bot'
                'content' => $reply
            ]);

            // Broadcast event
            try {
                broadcast(new MessageSent($aiMessage))->toOthers();
            } catch (Exception $e) {
                Log::error("AIReplyJob: Broadcast failed", [
                    'error' => $e->getMessage(),
                    'message_id' => $aiMessage->id
                ]);
                // Không throw exception vì message đã được tạo thành công
            }

            Log::info("AIReplyJob: Success", [
                'original_message_id' => $this->messageId,
                'ai_message_id' => $aiMessage->id
            ]);
        } catch (Exception $e) {
            Log::error("AIReplyJob: Handle failed", [
                'message_id' => $this->messageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw để Laravel có thể retry
        }
    }

    private function callAI($text)
    {
        // Tạm thời trả về reply đơn giản
        // Sau này có thể tích hợp với AI API thật
        $replies = [
            "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.",
            "Xin chào! Bạn cần hỗ trợ gì? Chúng tôi sẵn sàng giúp đỡ.",
            "Cảm ơn tin nhắn của bạn. Đội ngũ hỗ trợ sẽ liên hệ lại trong thời gian sớm nhất.",
        ];
        
        return $replies[array_rand($replies)];
    }

    /**
     * Xử lý khi job fail
     */
    public function failed(Exception $exception)
    {
        Log::error("AIReplyJob: Job failed permanently", [
            'message_id' => $this->messageId,
            'error' => $exception->getMessage()
        ]);
    }
}
