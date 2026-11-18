<?php

use App\Models\Initiative;
use Illuminate\Database\Migrations\Migration;

/**
 * Corrects the city name in the mission initiatives: Visakhapatnam, not Vishakhapatnam.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->rename('Vishakhapatnam', 'Visakhapatnam');
    }

    public function down(): void
    {
        $this->rename('Visakhapatnam', 'Vishakhapatnam');
    }

    private function rename(string $from, string $to): void
    {
        Initiative::query()->where('body', 'like', "%{$from}%")->each(function (Initiative $initiative) use ($from, $to): void {
            $initiative->body = str_replace($from, $to, $initiative->body);
            $initiative->saveQuietly();
        });
    }
};
