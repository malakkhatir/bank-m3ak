<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'account_no',
        'date',
        'type',
        'amount',
        'description',
        'status',
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'datetime',
    ];

    /**
     * Relationship back to bank account
     */
    public function account()
    {
        return $this->belongsTo(Account::class, 'account_no');
    }
}
