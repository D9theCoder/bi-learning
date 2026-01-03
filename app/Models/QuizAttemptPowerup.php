<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class QuizAttemptPowerup extends Pivot
{
    public $timestamps = false;

    public $incrementing = true;

    protected $table = 'quiz_attempt_powerups';

    protected $fillable = [
        'quiz_attempt_id',
        'powerup_id',
        'used_at',
        'details',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
            'details' => 'array',
        ];
    }
}
