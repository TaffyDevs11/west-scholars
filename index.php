<?php

/**
 * Front controller — the ONLY PHP file reachable over HTTP.
 *
 * Everything else (src/, config/, storage/, vendor/, tests/) lives outside
 * this directory. Point your web server's document root at `public/` and
 * nothing else in the project can be requested, whatever its filename.
 *
 * SERVER SETUP
 * ------------
 * Apache (XAMPP, Hostinger): handled by public/.htaccess — no extra work.
 *
 * PHP's built-in server, for a quick local run:
 *     php -S localhost:8000 -t public public/index.php
 *
 * nginx: see docs/DEPLOYMENT.md for the try_files block.
 */

declare(strict_types=1);

use West\Scholars\App;

/*
 * Static files under the built-in server.
 *
 * When `php -S` is given a router script, that script receives EVERY
 * request — including /assets/css/app.css. Returning false hands the
 * request back to the server, which then serves the file itself.
 *
 * Apache and nginx never reach this: their own configuration serves a real
 * file before PHP is involved (see .htaccess and docs/DEPLOYMENT.md). The
 * SAPI check makes that explicit, so this block cannot affect production.
 */
if (PHP_SAPI === 'cli-server') {
    $path = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $file = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $path);

    // is_file() only — never a directory, and never anything outside
    // public/, since $path is the URL path and realpath() is checked below.
    if ($path !== '/' && is_file($file)) {
        $real = realpath($file);
        $root = realpath(__DIR__);

        if ($real !== false && $root !== false && str_starts_with($real, $root . DIRECTORY_SEPARATOR)) {
            return false;
        }
    }
}

require_once dirname(__DIR__) . '/bootstrap.php';

(new App())->run();
