/*
 * GENERATED FILE — do not edit.
 * 
 * Copied from public/assets/js/validation.js by bin/build-pages.php.
 * Edit the original and re-run:  php bin/build-pages.php
 */
/**
 * Client-side validation for the scholar profile form.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT
 * --------------------------------
 * This is an accelerator. It tells a scholar about a problem in the moment
 * rather than after a round trip. It is NOT a security control and nothing
 * here is trusted: every rule below is enforced again in PHP by
 * src/Validation/ProfileValidator.php, and a request that never loaded this
 * file - curl, a replayed POST, a DOM edited in devtools - hits exactly the
 * same checks.
 *
 * KEEPING THE TWO IN STEP
 * -----------------------
 * The limits are not written twice. Year bounds, the maximum upload size,
 * the accepted file types and the list of employment statuses that need a
 * company name are all read from `data-*` attributes that PHP renders from
 * the same configuration the server validates against. Change
 * config/config.php and both sides move together.
 *
 * No inline script anywhere: the Content-Security-Policy is script-src
 * 'self' with no 'unsafe-inline', which is what makes an injected <script>
 * inert. That is why this file is loaded with `defer` from the template and
 * every handler is attached here rather than with an on* attribute.
 */

(function () {
    'use strict';

    var form = document.querySelector('[data-profile-form]');

    if (!form) {
        return;
    }

    /* ---------------------------------------------------------------
     | Rules read from the server
     |---------------------------------------------------------------- */

    var rules = {
        yearMin: parseInt(form.dataset.yearMin, 10) || 2000,
        yearMax: parseInt(form.dataset.yearMax, 10) || new Date().getFullYear() + 10,
        maxUploadBytes: parseInt(form.dataset.maxUploadBytes, 10) || 5242880,
        allowedExtensions: (form.dataset.allowedExtensions || 'pdf,jpg,jpeg,png')
            .split(',')
            .map(function (value) { return value.trim().toLowerCase(); })
            .filter(Boolean),
        companyStatuses: (form.dataset.companyStatuses || 'working,entrepreneurship')
            .split(',')
            .map(function (value) { return value.trim(); })
            .filter(Boolean),
        hasExistingDocument: form.dataset.hasDocument === '1'
    };

    var currentYear = new Date().getFullYear();

    /* ---------------------------------------------------------------
     | Small helpers
     |---------------------------------------------------------------- */

    function field(name) {
        return form.querySelector('[name="' + name + '"]');
    }

    function clean(value) {
        return (value || '').replace(/[\s ]+/g, ' ').trim();
    }

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

    function humanExtensionList() {
        var list = rules.allowedExtensions.map(function (extension) {
            return extension.toUpperCase();
        });

        if (list.length < 2) {
            return list[0] || 'a supported';
        }

        return list.slice(0, -1).join(', ') + ' or ' + list[list.length - 1];
    }

    /**
     * Show or clear the message under a control.
     *
     * aria-invalid and aria-describedby are set alongside the visual state so
     * a screen-reader user gets the same information a sighted user does -
     * the error is announced when focus reaches the field, not just coloured.
     */
    function setError(input, message) {
        if (!input) {
            return;
        }

        var holder = document.getElementById(input.name + '-error');

        if (message) {
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');

            if (holder) {
                holder.textContent = message;
                input.setAttribute('aria-describedby', holder.id);
            }

            return false;
        }

        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');

        if (holder) {
            holder.textContent = '';
        }

        return true;
    }

    /* ---------------------------------------------------------------
     | Field rules - each mirrors one method of ProfileValidator
     |---------------------------------------------------------------- */

    function validateName(input, label) {
        var value = clean(input.value);

        if (value === '') {
            return setError(input, label + ' is required.');
        }

        if (value.length > 100) {
            return setError(input, label + ' must be 100 characters or fewer.');
        }

        /*
         * Mirrors the server's \p{L} check. Unicode property escapes need
         * the /u flag and are unsupported in older browsers, so the pattern
         * is built with `new RegExp` inside a try/catch: where it is not
         * available the client simply skips this rule and the server still
         * enforces it. Failing open here is correct - the alternative is a
         * script error that breaks the whole form.
         */
        try {
            var namePattern = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}' \\-.]*$", 'u');

            if (!namePattern.test(value)) {
                return setError(input, label + ' may only contain letters, spaces, hyphens and apostrophes.');
            }
        } catch (error) {
            /* Unicode property escapes unsupported; leave it to the server. */
        }

        return setError(input, '');
    }

    function validateYearEnrolled() {
        var input = field('year_enrolled');
        var value = clean(input.value);

        if (value === '') {
            return setError(input, 'Year enrolled is required.');
        }

        if (!/^\d{4}$/.test(value)) {
            return setError(input, 'Year enrolled must be a four-digit year.');
        }

        var year = parseInt(value, 10);

        if (year < rules.yearMin || year > rules.yearMax) {
            return setError(input, 'Year enrolled must be between ' + rules.yearMin + ' and ' + rules.yearMax + '.');
        }

        return setError(input, '');
    }

    function validateGraduationYear() {
        var input = field('graduation_year');
        var status = field('graduation_status').value;
        var value = clean(input.value);

        // Conditional rule: required for graduates, optional for students.
        if (value === '') {
            return status === 'graduated'
                ? setError(input, 'Graduation year is required for graduates.')
                : setError(input, '');
        }

        if (!/^\d{4}$/.test(value)) {
            return setError(input, 'Graduation year must be a four-digit year.');
        }

        var year = parseInt(value, 10);

        if (year < rules.yearMin || year > rules.yearMax) {
            return setError(input, 'Graduation year must be between ' + rules.yearMin + ' and ' + rules.yearMax + '.');
        }

        if (status === 'graduated' && year > currentYear) {
            return setError(input, 'A graduation year in the future means you are still a current student.');
        }

        var enrolled = parseInt(clean(field('year_enrolled').value), 10);

        if (!isNaN(enrolled) && year < enrolled) {
            return setError(input, 'Graduation year cannot be earlier than the year you enrolled.');
        }

        return setError(input, '');
    }

    function validateSelect(input, message) {
        return setError(input, input.value === '' ? message : '');
    }

    function validateFieldOfStudy() {
        var input = field('field_of_study');
        var value = clean(input.value);

        if (value === '') {
            return setError(input, 'Field of study is required.');
        }

        if (value.length > 150) {
            return setError(input, 'Field of study must be 150 characters or fewer.');
        }

        return setError(input, '');
    }

    function validateCompany() {
        var input = field('company_name');
        var undisclosed = field('company_undisclosed');
        var employment = field('employment_status').value;

        // Not applicable for this status, or deliberately withheld.
        if (rules.companyStatuses.indexOf(employment) === -1 || undisclosed.checked) {
            return setError(input, '');
        }

        var value = clean(input.value);

        if (value === '') {
            return setError(input, 'Company name is required, or tick "Prefer not to disclose".');
        }

        if (value.length > 150) {
            return setError(input, 'Company name must be 150 characters or fewer.');
        }

        return setError(input, '');
    }

    /**
     * File checks the browser can do.
     *
     * Only the extension and the size - the browser cannot read magic bytes,
     * so the real content-type check happens server-side in UploadValidator.
     * Catching the obvious cases here saves uploading a 4 MB file only to be
     * told it is the wrong type.
     */
    function validateUpload() {
        var input = field('academic_results');

        if (!input) {
            return true;
        }

        var dropzone = form.querySelector('[data-upload-dropzone]');

        function markUpload(message) {
            if (dropzone) {
                dropzone.classList.toggle('is-invalid', Boolean(message));
            }

            return setError(input, message || '');
        }

        if (!input.files || input.files.length === 0) {
            // No new file. Required only when nothing is on record already.
            if (!rules.hasExistingDocument) {
                return markUpload('Please attach your academic results.');
            }

            return markUpload('');
        }

        var file = input.files[0];
        var extension = (file.name.split('.').pop() || '').toLowerCase();

        if (rules.allowedExtensions.indexOf(extension) === -1) {
            return markUpload('Please upload ' + humanExtensionList() + ' file.');
        }

        if (file.size === 0) {
            return markUpload('That file appears to be empty.');
        }

        if (file.size > rules.maxUploadBytes) {
            return markUpload(
                'The file is ' + humanBytes(file.size) +
                '. The maximum is ' + humanBytes(rules.maxUploadBytes) + '.'
            );
        }

        return markUpload('');
    }

    /* ---------------------------------------------------------------
     | Conditional visibility
     |----------------------------------------------------------------
     | The company field appears only for statuses where a company name is
     | meaningful, and the graduation-year label changes between an actual
     | and an expected year. Both mirror server behaviour: the server
     | discards a company name for an irrelevant status, so hiding the field
     | is showing the truth rather than hiding a value that would be saved.
     */

    function syncConditionalFields() {
        var employment = field('employment_status').value;
        var status = field('graduation_status').value;
        var companyWrapper = form.querySelector('[data-company-field]');
        var undisclosedWrapper = form.querySelector('[data-company-undisclosed-field]');
        var companyInput = field('company_name');
        var undisclosed = field('company_undisclosed');
        var showCompany = rules.companyStatuses.indexOf(employment) !== -1;

        if (companyWrapper) {
            companyWrapper.hidden = !showCompany;
        }

        if (undisclosedWrapper) {
            undisclosedWrapper.hidden = !showCompany;
        }

        // Disable rather than only hide, so the value is not posted at all.
        // The server ignores it anyway; this keeps the request honest.
        if (companyInput) {
            companyInput.disabled = !showCompany || undisclosed.checked;

            if (undisclosed.checked) {
                companyInput.value = '';
            }

            if (!showCompany) {
                setError(companyInput, '');
            }
        }

        var graduationLabel = form.querySelector('[data-graduation-year-label]');
        var graduationHint = form.querySelector('[data-graduation-year-hint]');

        if (graduationLabel) {
            graduationLabel.textContent = status === 'graduated'
                ? 'Graduation year'
                : 'Expected graduation year';
        }

        if (graduationHint) {
            graduationHint.textContent = status === 'graduated'
                ? 'Required — the year you completed your studies.'
                : 'Optional — leave blank if you are not sure yet.';
        }

        var requiredMark = form.querySelector('[data-graduation-year-required]');

        if (requiredMark) {
            requiredMark.hidden = status !== 'graduated';
        }
    }

    /* ---------------------------------------------------------------
     | Wiring
     |---------------------------------------------------------------- */

    function validateAll() {
        // && would short-circuit and leave later fields unchecked, so the
        // scholar would fix one error only to be shown the next. Collecting
        // the results in an array validates every field every time.
        var outcomes = [
            validateName(field('first_name'), 'First name'),
            validateName(field('surname'), 'Surname'),
            validateYearEnrolled(),
            validateSelect(field('graduation_status'), 'Please say whether you have graduated.'),
            validateGraduationYear(),
            validateFieldOfStudy(),
            validateSelect(field('employment_status'), 'Employment status is required.'),
            validateCompany(),
            validateUpload()
        ];

        return outcomes.every(Boolean);
    }

    var validators = {
        first_name: function () { validateName(field('first_name'), 'First name'); },
        surname: function () { validateName(field('surname'), 'Surname'); },
        year_enrolled: function () { validateYearEnrolled(); validateGraduationYear(); },
        graduation_year: validateGraduationYear,
        field_of_study: validateFieldOfStudy,
        company_name: validateCompany,
        academic_results: validateUpload
    };

    Object.keys(validators).forEach(function (name) {
        var input = field(name);

        if (!input) {
            return;
        }

        /*
         * Validate on blur, not on every keystroke: telling somebody their
         * e-mail address is invalid while they are still typing the third
         * character is noise. Once a field HAS an error, switch to live
         * checking on input so the message clears the moment it is fixed.
         */
        input.addEventListener('blur', validators[name]);

        input.addEventListener('input', function () {
            if (input.classList.contains('is-invalid')) {
                validators[name]();
            }
        });
    });

    var academicResults = field('academic_results');

    if (academicResults) {
        academicResults.addEventListener('change', validateUpload);
    }

    field('graduation_status').addEventListener('change', function () {
        syncConditionalFields();
        validateGraduationYear();
    });

    field('employment_status').addEventListener('change', function () {
        syncConditionalFields();
        validateCompany();
    });

    field('company_undisclosed').addEventListener('change', function () {
        syncConditionalFields();
        validateCompany();
    });

    form.addEventListener('submit', function (event) {
        if (!validateAll()) {
            event.preventDefault();

            var firstInvalid = form.querySelector('.is-invalid');

            if (firstInvalid) {
                // Move focus as well as scrolling: a screen-reader user gets
                // nothing from a scroll alone.
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });

                if (typeof firstInvalid.focus === 'function') {
                    firstInvalid.focus({ preventScroll: true });
                }
            }

            return;
        }

        /*
         * Disable the submit button so an impatient double-click cannot
         * create two profiles. The button is disabled rather than the form,
         * because disabling the form would stop the fields being submitted
         * at all.
         */
        var submit = form.querySelector('[data-submit]');

        if (submit) {
            submit.disabled = true;
            submit.textContent = submit.dataset.busyLabel || 'Saving…';
        }
    });

    // Run once on load so a form rendered with a stored employment status
    // starts in the right shape.
    syncConditionalFields();
})();
