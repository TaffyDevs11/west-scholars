/**
 * Confirmation for destructive form submissions.
 *
 * Any form carrying `data-confirm="..."` asks before it submits.
 *
 * This exists as a file rather than an `onsubmit` attribute because the
 * Content-Security-Policy is `script-src 'self'` with no 'unsafe-inline' —
 * which is what makes an injected <script> inert, and is only possible
 * because there is no inline script anywhere in the codebase.
 *
 * It is a courtesy, not a control: the server re-checks the CSRF token and
 * the administrator role on every destructive route, so a viewer who
 * bypasses this dialog gains nothing.
 */

(function () {
    'use strict';

    // Delegated from the document, so it covers forms added after load.
    document.addEventListener('submit', function (event) {
        var form = event.target.closest('[data-confirm]');

        if (!form) {
            return;
        }

        var message = form.getAttribute('data-confirm') || 'Are you sure?';

        if (!window.confirm(message)) {
            event.preventDefault();
        }
    });
})();
