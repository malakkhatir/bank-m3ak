<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
Schema::create('transactions', function (Blueprint $table) {

    $table->string('id')->primary();

    $table->string('account_no');

    $table->foreign('account_no')
          ->references('account_no')
          ->on('accounts')
          ->cascadeOnDelete();

    $table->timestamp('date')->useCurrent();

    $table->enum('type',[
        'Dépôt',
        'Retrait',
        'Virement'
    ]);

    $table->decimal('amount',15,2);

    $table->string('description')->nullable();

    $table->enum('status',[
        'Validé',
        'En attente',
        'Rejeté'
    ])->default('Validé');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
