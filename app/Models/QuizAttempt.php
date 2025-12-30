<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\QuizAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'user_id',
        'answers',
        'score',
        'total_points',
        'started_at',
        'completed_at',
        'is_graded',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'is_graded' => 'boolean',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        if (! $this->assessment->time_limit_minutes || ! $this->started_at) {
            return false;
        }

        return now()->greaterThan(
            $this->started_at->addMinutes($this->assessment->time_limit_minutes)
        );
    }

    public function getRemainingTimeAttribute(): ?int
    {
        if (! $this->assessment->time_limit_minutes || ! $this->started_at) {
            return null;
        }

        $endTime = $this->started_at->addMinutes($this->assessment->time_limit_minutes);
        $remaining = now()->diffInSeconds($endTime, false);

        return max(0, $remaining);
    }
}
