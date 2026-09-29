/**
 * Drag-and-drop behaviour for the academic-results field.
 *
 * Progressive enhancement over a plain `<input type="file">`. With
 * JavaScript off the input still works; this adds a drop target and a
 * preview of the chosen file.
 *
 * Validation of the dropped file is left to validation.js, which fires on
 * the input's `change` event - so a file that arrives by drag is checked by
 * exactly the same code as one chosen through the file picker.
 */

(function () {
    'use strict';

    var dropzone = document.querySelector('[data-upload-dropzone]');
    var input = document.querySelector('[data-upload-input]');

    if (!dropzone || !input) {
        return;
    }

    var preview = document.querySelector('[data-upload-preview]');
    var previewName = document.querySelector('[data-upload-name]');
    var previewMeta = document.querySelector('[data-upload-meta]');
    var previewBadge = document.querySelector('[data-upload-badge]');
    var prompt = document.querySelector('[data-upload-prompt]');

    function humanBytes(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        }

        var units = ['KB', 'MB', 'GB'];
        var value = bytes / 1024;
        var index = 0;

        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index += 1;
        }

        return (value < 10 ? value.toFixed(1) : Math.round(value)) + ' ' + units[index];
    }

    /* ---------------------------------------------------------------
     | Drag and drop
     |----------------------------------------------------------------
     | Every one of these needs preventDefault: the browser's default for a
     | dropped file is to navigate away and display it, which would lose the
     | half-filled form. dragover in particular must be prevented on every
     | single event or the drop is never delivered at all.
     */

    ['dragenter', 'dragover'].forEach(function (name) {
        dropzone.addEventListener(name, function (event) {
            event.preventDefault();
            event.stopPropagation();
            dropzone.classList.add('is-dragover');
        });
    });

    ['dragleave', 'drop'].forEach(function (name) {
        dropzone.addEventListener(name, function (event) {
            event.preventDefault();
            event.stopPropagation();
            dropzone.classList.remove('is-dragover');
        });
    });

    dropzone.addEventListener('drop', function (event) {
        var files = event.dataTransfer && event.dataTransfer.files;

        if (!files || files.length === 0) {
            return;
        }

        /*
         * DataTransfer is the only way to put a dropped file into a file
         * input programmatically - `input.files` is otherwise read-only.
         * Where it is unsupported the drop is ignored and the user can still
         * click to choose a file, so the fallback is a working form rather
         * than a broken one.
         */
        try {
            var transfer = new DataTransfer();
            transfer.items.add(files[0]);
            input.files = transfer.files;
        } catch (error) {
            return;
        }

        // Synthesise the event the picker would have fired, so validation.js
        // and the preview below both run for a dropped file too.
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    /* ---------------------------------------------------------------
     | Preview
     |---------------------------------------------------------------- */

    input.addEventListener('change', function () {
        if (!input.files || input.files.length === 0) {
            return;
        }

        var file = input.files[0];
        var extension = (file.name.split('.').pop() || 'file').toUpperCase();

        if (previewName) {
            // textContent, never innerHTML: the filename is user input and
            // assigning it as markup would be a self-inflicted XSS.
            previewName.textContent = file.name;
        }

        if (previewMeta) {
            previewMeta.textContent = extension + ' · ' + humanBytes(file.size) + ' · ready to upload';
        }

        if (previewBadge) {
            previewBadge.textContent = extension.slice(0, 4);
        }

        if (preview) {
            preview.hidden = false;
        }

        if (prompt) {
            prompt.textContent = 'Choose a different file';
        }
    });
})();
