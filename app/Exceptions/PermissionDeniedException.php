<?php

namespace App\Exceptions;

use Exception;

class PermissionDeniedException extends Exception
{
    public function __construct(
        public string $message = 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        public ?string $module = null,
    ) {
        parent::__construct($this->message);
    }
}
