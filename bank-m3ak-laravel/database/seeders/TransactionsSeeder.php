<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('transactions')->insert([

            [
                'id'=>'TX-1001',
                'account_no'=>'BM-0010203',
                'date'=>'2026-06-10 11:00:00',
                'type'=>'Dépôt',
                'amount'=>5000,
                'description'=>'Dépôt initial espèces',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1002',
                'account_no'=>'BM-0020304',
                'date'=>'2026-06-12 14:30:00',
                'type'=>'Dépôt',
                'amount'=>15000,
                'description'=>'Versement de salaire',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1003',
                'account_no'=>'BM-0010203',
                'date'=>'2026-06-15 10:15:00',
                'type'=>'Virement',
                'amount'=>2000,
                'description'=>'Virement à Fatima Zahra',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1004',
                'account_no'=>'BM-0020304',
                'date'=>'2026-06-15 10:15:00',
                'type'=>'Dépôt',
                'amount'=>2000,
                'description'=>'Reçu de Ahmed Alaoui',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1005',
                'account_no'=>'BM-0030405',
                'date'=>'2026-06-18 09:45:00',
                'type'=>'Retrait',
                'amount'=>1200,
                'description'=>'Retrait GAB Marrakech',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1006',
                'account_no'=>'BM-0040506',
                'date'=>'2026-06-20 16:00:00',
                'type'=>'Dépôt',
                'amount'=>50000,
                'description'=>'Virement commercial',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1007',
                'account_no'=>'BM-0060708',
                'date'=>'2026-06-22 11:20:00',
                'type'=>'Retrait',
                'amount'=>3000,
                'description'=>'Retrait en agence Agadir',
                'status'=>'Validé',
            ],
            [
                'id'=>'TX-1008',
                'account_no'=>'BM-0010203',
                'date'=>'2026-07-08 15:30:00',
                'type'=>'Retrait',
                'amount'=>8000,
                'description'=>'Retrait exceptionnel (En attente)',
                'status'=>'En attente',
            ],
            [
                'id'=>'TX-1009',
                'account_no'=>'BM-0020304',
                'date'=>'2026-07-09 08:00:00',
                'type'=>'Virement',
                'amount'=>12000,
                'description'=>'Virement vers BM-0030405',
                'status'=>'En attente',
            ],

        ]);
    }
}