<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Powerup extends Model
{
    /** @use HasFactory<\Database\Factories\PowerupFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'default_limit',
        'config',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config' => 'array',
            'default_limit' => 'integer',
        ];
    }

    public function assessments(): BelongsToMany
    {
        return $this->belongsToMany(Assessment::class)
            ->withPivot('limit');
    }

    public function quizAttempts(): BelongsToMany
    {
        return $this->belongsToMany(QuizAttempt::class, 'quiz_attempt_powerups')
            ->withPivot('used_at', 'details')
            ->using(QuizAttemptPowerup::class);
    }
}
