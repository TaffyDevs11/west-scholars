/*
 * GENERATED FILE — do not edit.
 * 
 * Copied from public/assets/js/career.js by bin/build-pages.php.
 * Edit the original and re-run:  php bin/build-pages.php
 */
/**
 * The career-history repeater.
 *
 * Progressive enhancement over rows the server already rendered. With
 * JavaScript off the form still works: PHP renders every stored role plus
 * one spare, and a scholar who needs more rows than that can save and come
 * back. This adds and removes rows without a round trip.
 *
 * No inline handlers anywhere — the Content-Security-Policy is
 * `script-src 'self'` with no 'unsafe-inline', which is what makes an
 * injected <script> inert.
 */

(function () {
    'use strict';

    var container = document.querySelector('[data-career]');

    if (!container) {
        return;
    }

    var rowsHolder = container.querySelector('[data-career-rows]');
    var addButton = container.querySelector('[data-career-add]');
    var form = document.querySelector('[data-profile-form]');

    if (!rowsHolder || !addButton) {
        return;
    }

    var maxEntries = parseInt(form && form.dataset.careerMax, 10) || 15;

    /**
     * Renumber every row's field names.
     *
     * PHP reads `career[0][company]`, `career[1][company]` and so on. After
     * a removal the indexes would otherwise have a hole in them — and while
     * PHP would still parse that into an array, the validator reports errors
     * by row position, so the numbering has to match what the user sees or
     * "Row 3" would point at the wrong line.
     */
    function renumber() {
        var rows = rowsHolder.querySelectorAll('[data-career-row]');

        Array.prototype.forEach.call(rows, function (row, index) {
            var inputs = row.querySelectorAll('input');

            Array.prototype.forEach.call(inputs, function (input) {
                // career[7][company] -> career[<index>][company]
                input.name = input.name.replace(/career\[\d+\]/, 'career[' + index + ']');

                if (input.id) {
                    var newId = input.id.replace(/career-\d+-/, 'career-' + index + '-');
                    var label = row.querySelector('label[for="' + input.id + '"]');

                    input.id = newId;

                    if (label) {
                        label.setAttribute('for', newId);
                    }
                }
            });
        });

        updateControls(rows.length);
    }

    function updateControls(count) {
        // One row must always remain, or there is nowhere to type.
        var removeButtons = rowsHolder.querySelectorAll('[data-career-remove]');

        Array.prototype.forEach.call(removeButtons, function (button) {
            button.hidden = count <= 1;
        });

        addButton.disabled = count >= maxEntries;
        addButton.textContent = count >= maxEntries
            ? 'Maximum of ' + maxEntries + ' roles'
            : '+ Add another role';
    }

    function addRow() {
        var rows = rowsHolder.querySelectorAll('[data-career-row]');

        if (rows.length >= maxEntries) {
            return;
        }

        /*
         * Cloned from the LAST row rather than built from a string, so the
         * markup, classes and attributes can never drift from what PHP
         * renders — there is only one definition of a row, in the template.
         */
        var template = rows[rows.length - 1].cloneNode(true);

        Array.prototype.forEach.call(template.querySelectorAll('input'), function (input) {
            input.value = '';
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
        });

        // A cloned row must not carry the previous row's error message.
        template.classList.remove('career__row--invalid');

        Array.prototype.forEach.call(template.querySelectorAll('.field__error'), function (node) {
            node.remove();
        });

        rowsHolder.appendChild(template);
        renumber();

        var firstInput = template.querySelector('input');

        if (firstInput) {
            firstInput.focus();
        }
    }

    addButton.addEventListener('click', addRow);

    // Delegated, so it covers rows added after load.
    rowsHolder.addEventListener('click', function (event) {
        var remove = event.target.closest('[data-career-remove]');

        if (!remove) {
            return;
        }

        var row = remove.closest('[data-career-row]');
        var rows = rowsHolder.querySelectorAll('[data-career-row]');

        if (!row || rows.length <= 1) {
            return;
        }

        var hasContent = Array.prototype.some.call(row.querySelectorAll('input'), function (input) {
            return input.value.trim() !== '';
        });

        // Only ask when there is something to lose; confirming the removal
        // of an empty row is pure friction.
        if (hasContent && !window.confirm('Remove this role?')) {
            return;
        }

        row.remove();
        renumber();
    });

    updateControls(rowsHolder.querySelectorAll('[data-career-row]').length);
})();
