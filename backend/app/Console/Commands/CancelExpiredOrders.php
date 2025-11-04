<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Api\CartController;

class CancelExpiredOrders extends Command
{
    protected $signature = 'orders:cancel-expired';
    protected $description = 'Tự động hủy các đơn hàng pending đã quá hạn';

    public function handle()
    {
        CartController::cancelExpiredOrders();
        $this->info('Đã hủy các đơn hàng expired.');
    }
}
