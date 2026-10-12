<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $primaryKey = 'account_no';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'account_no',
        'owner_id',
        'owner_name',
        'balance',
        'status',
        'pending_validation',
    ];

    protected $casts = [
        'balance' => 'float',
        'pending_validation' => 'boolean',
    ];

    /**
     * Relationship back to the owner client
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relationship with account transactions
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'account_no');
    }
}
