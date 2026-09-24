/*
 * GENERATED FILE — do not edit.
 * 
 * Copied from demo/assets/demo.js by bin/build-pages.php.
 * Edit the original and re-run:  php bin/build-pages.php
 */
/**
 * WEST Scholars — static demo controller.
 * =======================================
 *
 * GitHub Pages serves static files and does not run PHP, so this file
 * stands in for the server: it renders the same screens the PHP templates
 * render, and keeps "saved" records in localStorage instead of MySQL.
 *
 * WHAT IS REAL HERE
 *   * the markup and CSS classes, matching src/View/templates/ one for one
 *   * the client-side validator and upload widget, loaded unmodified from
 *     assets/js/ (see mountProfileScripts)
 *   * the conditional field behaviour, the error summary, the flash
 *     messages, the directory's search, filters, sorting and pagination
 *
 * WHAT IS NOT
 *   * no server-side validation runs, because there is no server. In the
 *     real application every rule in ProfileValidator is enforced again in
 *     PHP, and that is the copy that actually protects the data.
 *   * uploaded files are never read or stored. Only the name, size and type
 *     are noted so the file chip can be shown. The real application stores
 *     the bytes outside the web root under a random name — see
 *     src/Storage/FileStorage.php.
 *   * sign-in does not check a password.
 *
 * Written in plain ES5-compatible JavaScript with no build step, to match
 * the rest of the project.
 */

(function () {
    'use strict';

    /* ===============================================================
     | Configuration — mirrors config/config.example.php
     |================================================================
     | The real form gets these from PHP via data-* attributes. Keeping
     | the same values here means the validator behaves identically.
     */

    var CONFIG = {
        yearMin: 2000,
        yearMax: new Date().getFullYear() + 10,
        maxUploadBytes: 5 * 1024 * 1024,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
        companyStatuses: ['working', 'entrepreneurship']
    };

    // Mirrors ProfileValidator::GRADUATION_STATUSES / EMPLOYMENT_STATUSES.
    var GRADUATION_STATUSES = {
        graduated: 'Graduated',
        current_student: 'Current Student'
    };

    var EMPLOYMENT_STATUSES = {
        no_job: 'No job',
        entrepreneurship: 'Entrepreneurship',
        working: 'Working',
        student: 'Student'
    };

    var STORAGE_KEY = 'west-scholars-demo-v1';

    /* ===============================================================
     | Seed data
     |================================================================
     | The same cohort the README's screenshots show, so the directory
     | has something meaningful in it on a first visit.
     */

    function seedScholars() {
        return [
            row(1, 'Tendai', 'Moyo', 2019, 2023, 'graduated', 'Civil Engineering', 'working', 'Bridgeworks Ltd', false, 'transcript-2023.pdf'),
            row(2, 'Anna', 'Ncube', 2020, null, 'current_student', 'Medicine', 'student', null, false, 'results-sem2.pdf'),
            row(3, 'Farai', 'Chirwa', 2019, 2023, 'graduated', 'Computer Science', 'entrepreneurship', 'Chirwa Labs', false, 'final-transcript.pdf'),
            row(4, 'Rudo', 'Banda', 2021, null, 'current_student', 'Law', 'no_job', null, false, null),
            row(5, 'Kuda', 'Zimuto', 2018, 2022, 'graduated', 'Computer Science', 'working', null, true, 'degree-results.pdf'),
            row(6, 'Chipo', 'Dube', 2022, null, 'current_student', 'Accounting', 'student', null, false, 'year1-results.png'),
            row(7, 'Nyasha', 'Sibanda', 2020, 2024, 'graduated', 'Medicine', 'working', 'Parirenyatwa Group', false, 'mbchb-transcript.pdf'),
            row(8, 'Tapiwa', 'Mutasa', 2021, null, 'current_student', 'Electrical Engineering', 'student', null, false, null),
            row(9, 'Rumbi', 'Gwenzi', 2018, 2022, 'graduated', 'Economics', 'entrepreneurship', 'Gwenzi Advisory', false, 'transcript.pdf')
        ];
    }

    function row(id, first, last, enrolled, graduated, status, field, employment, company, undisclosed, document) {
        return {
            id: id,
            email: (first + '.' + last).toLowerCase() + '@example.org',
            first_name: first,
            surname: last,
            year_enrolled: enrolled,
            graduation_year: graduated,
            graduation_status: status,
            field_of_study: field,
            employment_status: employment,
            company_name: company,
            company_undisclosed: undisclosed,
            updated_at: '2026-09-0' + ((id % 9) + 1) + ' 10:00:00',
            documents: document
                ? [{
                    id: id * 10,
                    name: document,
                    size: 180000 + id * 37000,
                    type: /\.png$/.test(document) ? 'image/png' : 'application/pdf',
                    uploaded_at: '2026-0' + ((id % 8) + 1) + '-14',
                    current: true
                }]
                : []
        };
    }

    /* ===============================================================
     | "Persistence" — localStorage standing in for MySQL
     |================================================================
     | Every read and write is wrapped: localStorage throws in a private
     | window in some browsers, and a demo that white-screens there is
     | worse than one that simply forgets between visits.
     */

    var state = null;

    function load() {
        if (state) {
            return state;
        }

        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);

            if (raw) {
                state = JSON.parse(raw);

                if (state && state.scholars) {
                    return state;
                }
            }
        } catch (error) {
            /* Unavailable or corrupt — fall through to a fresh seed. */
        }

        state = { scholars: seedScholars(), session: null, nextId: 10 };
        save();

        return state;
    }

    function save() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            /* Storage full or blocked; the session continues in memory. */
        }
    }

    function reset() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            /* nothing to do */
        }

        state = null;
        load();
    }

    function findScholar(id) {
        var scholars = load().scholars;

        for (var i = 0; i < scholars.length; i++) {
            if (String(scholars[i].id) === String(id)) {
                return scholars[i];
            }
        }

        return null;
    }

    function currentUser() {
        return load().session;
    }

    function isAdmin() {
        var session = currentUser();

        return Boolean(session && session.role === 'admin');
    }

    function myScholar() {
        var session = currentUser();

        return session && session.scholarId ? findScholar(session.scholarId) : null;
    }

    /* ===============================================================
     | Helpers
     |================================================================ */

    /** Escape for HTML. The mirror of Str::e() in PHP. */
    function e(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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

    function initials(scholar) {
        return (scholar.first_name.charAt(0) + scholar.surname.charAt(0)).toUpperCase();
    }

    function fullName(scholar) {
        return scholar.first_name + ' ' + scholar.surname;
    }

    function currentDocument(scholar) {
        for (var i = 0; i < scholar.documents.length; i++) {
            if (scholar.documents[i].current) {
                return scholar.documents[i];
            }
        }

        return null;
    }

    function typeLabel(document) {
        return document.type === 'application/pdf'
            ? 'PDF'
            : document.type.split('/')[1].toUpperCase();
    }

    function expectsCompany(scholar) {
        return CONFIG.companyStatuses.indexOf(scholar.employment_status) !== -1;
    }

    /** The three genuinely different company states — mirrors Profile::companyDisplay(). */
    function companyDisplay(scholar) {
        if (!expectsCompany(scholar)) {
            return 'Not applicable';
        }

        if (scholar.company_undisclosed) {
            return 'Prefer not to disclose';
        }

        return scholar.company_name || 'Not provided';
    }

    function academicSummary(scholar) {
        if (scholar.graduation_status === 'graduated') {
            return scholar.graduation_year ? 'Graduated ' + scholar.graduation_year : 'Graduated';
        }

        return scholar.graduation_year
            ? 'Current student, expected ' + scholar.graduation_year
            : 'Current student';
    }

    /* ===============================================================
     | Flash messages
     |================================================================ */

    var pendingFlash = [];

    function flash(type, message) {
        pendingFlash.push({ type: type, message: message });
    }

    function renderFlash() {
        var holder = document.querySelector('[data-demo-flash]');
        var html = '';

        pendingFlash.forEach(function (item) {
            var isError = item.type === 'error';

            html += '<div class="flash flash--' + e(item.type) + '" role="' +
                (isError ? 'alert' : 'status') + '">' +
                '<span class="flash__icon" aria-hidden="true">' + (isError ? '!' : '&check;') + '</span>' +
                '<span>' + e(item.message) + '</span></div>';
        });

        holder.innerHTML = html;
        pendingFlash = [];
    }

    /* ===============================================================
     | Routing — hash based
     |================================================================
     | Hash routing rather than History API because GitHub Pages serves
     | static files: a real path like /profile would 404 on reload, since
     | there is no server to rewrite it to index.html.
     */

    function route() {
        var hash = window.location.hash.replace(/^#/, '') || '/';

        return hash.split('?')[0];
    }

    function queryParams() {
        var hash = window.location.hash.replace(/^#/, '');
        var index = hash.indexOf('?');
        var params = {};

        if (index === -1) {
            return params;
        }

        hash.substring(index + 1).split('&').forEach(function (pair) {
            if (!pair) {
                return;
            }

            var parts = pair.split('=');
            params[decodeURIComponent(parts[0])] = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
        });

        return params;
    }

    function go(path) {
        if (('#' + path) === window.location.hash) {
            render(); // same hash: no hashchange event fires
        } else {
            window.location.hash = path;
        }
    }

    /* ===============================================================
     | Chrome: navigation and account area
     |================================================================ */

    function renderChrome() {
        var nav = document.querySelector('[data-demo-nav]');
        var account = document.querySelector('[data-demo-account]');
        var session = currentUser();
        var path = route();

        function link(href, label, key) {
            return '<a class="nav__link' + (path === key ? ' is-active' : '') +
                '" href="#' + href + '">' + label + '</a>';
        }

        if (!session) {
            nav.innerHTML = '';
            account.innerHTML =
                '<a class="nav__link" href="#/login">Sign in</a>' +
                '<a class="btn btn--primary btn--sm" href="#/login">Create account</a>';

            return;
        }

        if (session.role === 'admin') {
            nav.innerHTML = link('/directory', 'Scholar directory', '/directory');
        } else {
            nav.innerHTML = link('/profile', 'My profile', '/profile') +
                link('/edit', 'Edit profile', '/edit');
        }

        account.innerHTML =
            '<span class="masthead__email">' + e(session.email) + '</span>' +
            (session.role === 'admin' ? '<span class="badge badge--admin">Admin</span>' : '') +
            '<button class="btn btn--ghost btn--sm" type="button" data-demo-signout>Sign out</button>';
    }

    /* ===============================================================
     | Views
     |================================================================ */

    function viewHome() {
        var steps = [
            ['1', 'Personal information', 'Your name as it appears on your academic records.'],
            ['2', 'Academic status', 'Year enrolled, graduation status and field of study.'],
            ['3', 'Employment', 'What you are doing now, and where — if you wish to say.'],
            ['4', 'Academic results', 'A PDF or photo of your latest transcript.']
        ];

        var cards = steps.map(function (step) {
            return '<div class="stat">' +
                '<span class="fieldset__number" aria-hidden="true">' + step[0] + '</span>' +
                '<p class="heading mt-16">' + e(step[1]) + '</p>' +
                '<p class="muted mt-8" style="font-size:14.5px">' + e(step[2]) + '</p>' +
                '</div>';
        }).join('');

        return '<div class="shell">' +
            '<section class="hero">' +
                '<svg class="hero__watermark" viewBox="0 0 32 32" aria-hidden="true">' +
                    '<path d="M16 5 2 11l14 6 14-6-14-6Z" fill="currentColor"/>' +
                    '<path d="M7 14.5V21c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>' +
                '</svg>' +
                '<div class="hero__inner">' +
                    '<p class="eyebrow">WEST Scholars Programme</p>' +
                    '<h1 class="display-1">Your scholar record, in one place.</h1>' +
                    '<p>Keep your enrolment details, academic progress and employment status ' +
                    'current, and upload your results securely. The programme uses this record ' +
                    'to stay in touch and to report on scholar outcomes.</p>' +
                    '<div class="hero__actions">' +
                        '<a class="btn btn--primary btn--lg" href="#/login">Try the demo</a>' +
                        '<a class="btn btn--secondary btn--lg" href="#/directory">View the directory</a>' +
                    '</div>' +
                '</div>' +
            '</section>' +
            '<section class="section">' +
                '<div class="section__head">' +
                    '<p class="eyebrow">What you will need</p>' +
                    '<h2 class="display-2">Four short sections</h2>' +
                    '<p>Most scholars complete this in a few minutes. Everything except your ' +
                    'academic results can be changed later.</p>' +
                '</div>' +
                '<div class="stat-grid">' + cards + '</div>' +
            '</section>' +
            '<section class="section">' +
                '<div class="card"><div class="card__body">' +
                    '<div class="row row--between">' +
                        '<div style="max-width:58ch">' +
                            '<p class="eyebrow">Your records are private</p>' +
                            '<h2 class="display-3 mt-8">Only you and programme administrators</h2>' +
                            '<p class="muted mt-16">In the real application, uploaded results are ' +
                            'stored outside the public web folder, given a random filename, and ' +
                            'served only after checking who is asking. There is no public link to ' +
                            'a transcript — not a guessable one, not an obscure one.</p>' +
                        '</div>' +
                        '<a class="btn btn--primary" href="#/login">Get started</a>' +
                    '</div>' +
                '</div></div>' +
            '</section>' +
        '</div>';
    }

    /**
     * Sign-in.
     *
     * The demo offers one-click accounts instead of a password field: there
     * is no server to check a password against, and a box that accepts
     * anything would misrepresent how the real sign-in works.
     */
    function viewLogin() {
        var scholars = load().scholars;
        var options = scholars.slice(0, 6).map(function (scholar) {
            return '<button class="doc-item" type="button" style="width:100%;cursor:pointer;text-align:left" ' +
                'data-demo-signin="' + scholar.id + '">' +
                '<span class="avatar avatar--sm" aria-hidden="true">' + e(initials(scholar)) + '</span>' +
                '<span class="file-chip__meta">' +
                    '<span class="file-chip__name">' + e(fullName(scholar)) + '</span>' +
                    '<span class="file-chip__detail">' + e(scholar.email) + '</span>' +
                '</span>' +
                '<span class="badge badge--neutral">Scholar</span>' +
                '</button>';
        }).join('');

        return '<div class="shell"><div class="auth" style="max-width:560px">' +
            '<div class="auth__head">' +
                '<p class="eyebrow">WEST Scholars</p>' +
                '<h1 class="display-2 mt-8">Sign in</h1>' +
                '<p>This is a static demo, so there is no password to check. ' +
                'Pick an account to explore with.</p>' +
            '</div>' +
            '<div class="card"><div class="card__body stack">' +
                '<div>' +
                    '<p class="eyebrow">Administrator</p>' +
                    '<div class="doc-list mt-16">' +
                        '<button class="doc-item" type="button" style="width:100%;cursor:pointer;text-align:left" data-demo-signin="admin">' +
                            '<span class="avatar avatar--sm" aria-hidden="true">WS</span>' +
                            '<span class="file-chip__meta">' +
                                '<span class="file-chip__name">Programme administrator</span>' +
                                '<span class="file-chip__detail">admin@westscholars.org</span>' +
                            '</span>' +
                            '<span class="badge badge--admin">Admin</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<p class="eyebrow">Scholars</p>' +
                    '<div class="doc-list mt-16">' + options + '</div>' +
                '</div>' +
            '</div></div>' +
            '<p class="auth__alt">The real application uses e-mail and a hashed password — ' +
            'see <code>src/Auth.php</code>.</p>' +
        '</div></div>';
    }

    /**
     * The profile form.
     *
     * Markup matches src/View/templates/profile/form.php, including the
     * data-* attributes, so the real validation.js drives it unchanged.
     */
    function viewForm(scholar, isAdminEditing) {
        var employment = scholar ? scholar.employment_status : '';
        var graduation = scholar ? scholar.graduation_status : '';
        var undisclosed = scholar ? scholar.company_undisclosed : false;
        var showCompany = CONFIG.companyStatuses.indexOf(employment) !== -1;
        var document_ = scholar ? currentDocument(scholar) : null;

        function options(map, selected) {
            var html = '<option value="">Select status…</option>';

            Object.keys(map).forEach(function (key) {
                html += '<option value="' + e(key) + '"' +
                    (selected === key ? ' selected' : '') + '>' + e(map[key]) + '</option>';
            });

            return html;
        }

        function field(name, label, value, attrs, hint, required) {
            return '<div class="field">' +
                '<label class="field__label" for="' + name + '">' + label +
                    (required ? ' <span class="field__required" aria-hidden="true">*</span>' : '') +
                '</label>' +
                '<input class="input" id="' + name + '" name="' + name + '" ' + (attrs || '') +
                    ' value="' + e(value === null || value === undefined ? '' : value) + '">' +
                (hint ? '<p class="field__hint">' + hint + '</p>' : '') +
                '<p class="field__error" id="' + name + '-error"></p>' +
            '</div>';
        }

        var existingChip = document_
            ? '<div class="file-chip mt-0">' +
                '<span class="file-chip__badge">' + e(typeLabel(document_)) + '</span>' +
                '<span class="file-chip__meta">' +
                    '<span class="file-chip__name">' + e(document_.name) + '</span>' +
                    '<span class="file-chip__detail">On file · ' + e(humanBytes(document_.size)) + '</span>' +
                '</span>' +
              '</div>' +
              '<p class="field__hint mt-8">Uploading a new file replaces this one. The previous ' +
              'version is kept in the record’s history, so nothing is lost.</p>'
            : '';

        return '<div class="shell">' +
            '<div class="section__head">' +
                '<p class="eyebrow">' + (scholar ? 'Edit profile' : 'Create profile') + '</p>' +
                '<h1 class="display-2">' +
                    (isAdminEditing && scholar ? e(fullName(scholar))
                        : (scholar ? 'Your scholar profile' : 'Set up your scholar profile')) +
                '</h1>' +
                '<p>' + (scholar
                    ? 'Keep your details current so the programme can stay in touch and report accurately on scholar outcomes.'
                    : 'Four short sections. Everything except your academic results can be changed later.') + '</p>' +
            '</div>' +

            '<div class="error-summary mt-24" data-demo-error-summary hidden role="alert">' +
                '<p class="error-summary__title">Please check the highlighted fields</p>' +
            '</div>' +

            '<form class="card mt-24" data-profile-form novalidate ' +
                'data-year-min="' + CONFIG.yearMin + '" ' +
                'data-year-max="' + CONFIG.yearMax + '" ' +
                'data-max-upload-bytes="' + CONFIG.maxUploadBytes + '" ' +
                'data-allowed-extensions="' + e(CONFIG.allowedExtensions.join(',')) + '" ' +
                'data-company-statuses="' + e(CONFIG.companyStatuses.join(',')) + '" ' +
                'data-has-document="' + (document_ ? '1' : '0') + '">' +

            '<div class="card__body stack">' +

                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">1</span>' +
                        '<span class="fieldset__title">Personal information</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">Your name as it appears on your academic records.</p>' +
                    '<div class="field-grid">' +
                        field('first_name', 'First name', scholar ? scholar.first_name : '',
                            'type="text" maxlength="100" autocomplete="given-name"', '', true) +
                        field('surname', 'Surname', scholar ? scholar.surname : '',
                            'type="text" maxlength="100" autocomplete="family-name"', '', true) +
                    '</div>' +
                '</fieldset>' +

                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">2</span>' +
                        '<span class="fieldset__title">Academic status</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">Your place in the programme and what you are studying.</p>' +
                    '<div class="field-grid">' +
                        field('year_enrolled', 'Year enrolled in the scholarship',
                            scholar ? scholar.year_enrolled : '',
                            'type="number" inputmode="numeric" min="' + CONFIG.yearMin + '" max="' + CONFIG.yearMax + '" step="1" placeholder="' + new Date().getFullYear() + '"',
                            'The year you joined WEST Scholars.', true) +

                        '<div class="field">' +
                            '<label class="field__label" for="graduation_status">Graduation status ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<select class="select" id="graduation_status" name="graduation_status">' +
                                options(GRADUATION_STATUSES, graduation) +
                            '</select>' +
                            '<p class="field__error" id="graduation_status-error"></p>' +
                        '</div>' +

                        '<div class="field">' +
                            '<label class="field__label" for="graduation_year">' +
                                '<span data-graduation-year-label>' +
                                    (graduation === 'graduated' ? 'Graduation year' : 'Expected graduation year') +
                                '</span>' +
                                '<span class="field__required" data-graduation-year-required aria-hidden="true"' +
                                    (graduation === 'graduated' ? '' : ' hidden') + '>*</span>' +
                            '</label>' +
                            '<input class="input" type="number" id="graduation_year" name="graduation_year" ' +
                                'inputmode="numeric" min="' + CONFIG.yearMin + '" max="' + CONFIG.yearMax + '" step="1" ' +
                                'value="' + e(scholar && scholar.graduation_year ? scholar.graduation_year : '') + '">' +
                            '<p class="field__hint" data-graduation-year-hint>' +
                                (graduation === 'graduated'
                                    ? 'Required — the year you completed your studies.'
                                    : 'Optional — leave blank if you are not sure yet.') +
                            '</p>' +
                            '<p class="field__error" id="graduation_year-error"></p>' +
                        '</div>' +

                        field('field_of_study', 'Field of study', scholar ? scholar.field_of_study : '',
                            'type="text" maxlength="150" placeholder="e.g. Civil Engineering"', '', true) +
                    '</div>' +
                '</fieldset>' +

                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">3</span>' +
                        '<span class="fieldset__title">Employment</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">What you are doing now. This helps the programme report on scholar outcomes.</p>' +
                    '<div class="field-grid">' +
                        '<div class="field">' +
                            '<label class="field__label" for="employment_status">Employment status ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<select class="select" id="employment_status" name="employment_status">' +
                                options(EMPLOYMENT_STATUSES, employment) +
                            '</select>' +
                            '<p class="field__error" id="employment_status-error"></p>' +
                        '</div>' +

                        '<div class="field" data-company-field' + (showCompany ? '' : ' hidden') + '>' +
                            '<label class="field__label" for="company_name">Company name ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<input class="input" type="text" id="company_name" name="company_name" ' +
                                'maxlength="150" placeholder="Where you work, or your own company"' +
                                (undisclosed ? ' disabled' : '') +
                                ' value="' + e(scholar && scholar.company_name ? scholar.company_name : '') + '">' +
                            '<p class="field__error" id="company_name-error"></p>' +
                        '</div>' +

                        '<div class="field field--full" data-company-undisclosed-field' + (showCompany ? '' : ' hidden') + '>' +
                            '<label class="checkbox">' +
                                '<input type="checkbox" id="company_undisclosed" name="company_undisclosed" value="1"' +
                                    (undisclosed ? ' checked' : '') + '>' +
                                '<span class="checkbox__text">' +
                                    '<strong>Prefer not to disclose</strong>' +
                                    '<span>Your employer will not be stored at all — not hidden, not recorded.</span>' +
                                '</span>' +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                '</fieldset>' +

                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">4</span>' +
                        '<span class="fieldset__title">Academic results</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">Your latest transcript or results slip. In the real ' +
                    'application this is stored privately, outside the web root — here the file is ' +
                    'never read, only its name and size are noted.</p>' +

                    existingChip +

                    '<div class="field field--full mt-16">' +
                        '<input class="upload__input" type="file" id="academic_results" name="academic_results" ' +
                            'data-upload-input accept="' +
                            e(CONFIG.allowedExtensions.map(function (x) { return '.' + x; }).join(',')) + '">' +
                        '<label class="upload" for="academic_results" data-upload-dropzone>' +
                            '<span class="upload__icon" aria-hidden="true">' +
                                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
                                '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>' +
                            '</span>' +
                            '<span class="upload__title" data-upload-prompt>Drag a file here, or <u>browse</u></span>' +
                            '<span class="upload__hint">' +
                                e(CONFIG.allowedExtensions.join(', ').toUpperCase()) +
                                ' · up to ' + e(humanBytes(CONFIG.maxUploadBytes)) +
                            '</span>' +
                        '</label>' +
                        '<div class="file-chip mt-16" data-upload-preview hidden>' +
                            '<span class="file-chip__badge" data-upload-badge>FILE</span>' +
                            '<span class="file-chip__meta">' +
                                '<span class="file-chip__name" data-upload-name></span>' +
                                '<span class="file-chip__detail" data-upload-meta></span>' +
                            '</span>' +
                        '</div>' +
                        '<p class="field__error mt-8" id="academic_results-error"></p>' +
                    '</div>' +
                '</fieldset>' +
            '</div>' +

            '<div class="card__footer">' +
                '<button class="btn btn--primary" type="submit" data-submit data-busy-label="Saving…">' +
                    (scholar ? 'Save changes' : 'Create profile') +
                '</button>' +
                '<a class="btn btn--ghost" href="#' +
                    (isAdminEditing && scholar ? '/scholar/' + scholar.id : (scholar ? '/profile' : '/')) +
                '">Cancel</a>' +
                '<span class="subtle grow" style="text-align:right">' +
                    '<span class="field__required" aria-hidden="true">*</span> required</span>' +
            '</div>' +
            '</form>' +
        '</div>';
    }

    /** Read-only profile — mirrors profile/show.php. */
    function viewProfile(scholar, isAdminView) {
        if (!scholar) {
            return '<div class="shell"><div class="card"><div class="empty">' +
                '<h2>Your profile is not set up yet</h2>' +
                '<p>Four short sections: your name, your academic status, what you are doing ' +
                'now, and a copy of your academic results.</p>' +
                '<a class="btn btn--primary btn--lg" href="#/edit">Create my profile</a>' +
                '</div></div></div>';
        }

        function detail(label, value, muted) {
            return '<div class="detail">' +
                '<p class="detail__label">' + e(label) + '</p>' +
                '<p class="detail__value' + (muted ? ' detail__value--muted' : '') + '">' + e(value) + '</p>' +
            '</div>';
        }

        var documents = scholar.documents.slice().reverse();
        var current = currentDocument(scholar);

        var docsHtml = current
            ? '<div class="doc-list">' + documents.map(function (item) {
                return '<div class="doc-item' + (item.current ? '' : ' doc-item--superseded') + '">' +
                    '<span class="file-chip__badge">' + e(typeLabel(item)) + '</span>' +
                    '<span class="file-chip__meta">' +
                        '<span class="file-chip__name">' + e(item.name) + '</span>' +
                        '<span class="file-chip__detail">' + e(humanBytes(item.size)) +
                            ' · ' + e(item.uploaded_at) + '</span>' +
                    '</span>' +
                    '<span class="badge ' + (item.current ? 'badge--success">Current' : 'badge--neutral">Superseded') + '</span>' +
                    '<button class="btn btn--secondary btn--sm" type="button" data-demo-download>Download</button>' +
                '</div>';
            }).join('') + '</div>' +
            '<p class="subtle mt-16">In the real application these are stored outside the public ' +
            'web folder and served only to the scholar and programme administrators.</p>'
            : '<div class="card"><div class="card__body"><div class="row row--between">' +
                '<p class="muted">No academic results have been uploaded yet.</p>' +
                (isAdminView ? '' : '<a class="btn btn--secondary btn--sm" href="#/edit">Upload now</a>') +
              '</div></div></div>';

        var hasRealCompany = expectsCompany(scholar) && !scholar.company_undisclosed && scholar.company_name;

        return '<div class="shell">' +
            (isAdminView ? '<a class="btn btn--ghost btn--sm" href="#/directory">&larr; Back to directory</a>' : '') +
            '<div class="row row--between mt-16">' +
                '<div class="profile-header">' +
                    '<span class="avatar" aria-hidden="true">' + e(initials(scholar)) + '</span>' +
                    '<div>' +
                        '<h1 class="display-2">' + e(fullName(scholar)) + '</h1>' +
                        '<div class="profile-header__meta">' +
                            '<span class="badge ' + (scholar.graduation_status === 'graduated' ? 'badge--success' : 'badge--blue') + '">' +
                                e(GRADUATION_STATUSES[scholar.graduation_status]) + '</span>' +
                            '<span class="badge badge--neutral">Cohort ' + e(scholar.year_enrolled) + '</span>' +
                            '<span class="badge badge--neutral">' + e(EMPLOYMENT_STATUSES[scholar.employment_status]) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<a class="btn btn--primary" href="#' +
                    (isAdminView ? '/scholar/' + scholar.id + '/edit' : '/edit') + '">Edit profile</a>' +
            '</div>' +

            '<section class="section" style="margin-top:40px">' +
                '<h2 class="heading" style="margin-bottom:16px">Personal &amp; academic</h2>' +
                '<div class="detail-grid">' +
                    detail('First name', scholar.first_name) +
                    detail('Surname', scholar.surname) +
                    detail('Year enrolled', scholar.year_enrolled) +
                    detail('Graduation status', GRADUATION_STATUSES[scholar.graduation_status]) +
                    detail(scholar.graduation_status === 'graduated' ? 'Graduation year' : 'Expected graduation',
                        scholar.graduation_year || 'Not set', !scholar.graduation_year) +
                    detail('Field of study', scholar.field_of_study) +
                '</div>' +
            '</section>' +

            '<section class="section" style="margin-top:40px">' +
                '<h2 class="heading" style="margin-bottom:16px">Employment</h2>' +
                '<div class="detail-grid">' +
                    detail('Employment status', EMPLOYMENT_STATUSES[scholar.employment_status]) +
                    detail('Company', companyDisplay(scholar), !hasRealCompany) +
                    (isAdminView ? detail('Account e-mail', scholar.email) : '') +
                '</div>' +
            '</section>' +

            '<section class="section" style="margin-top:40px">' +
                '<div class="row row--between" style="margin-bottom:16px">' +
                    '<h2 class="heading">Academic results</h2>' +
                    (documents.length > 1 ? '<span class="subtle">' + documents.length + ' versions on record</span>' : '') +
                '</div>' + docsHtml +
            '</section>' +
        '</div>';
    }

    /** The administrator directory — search, filters, sorting, pagination. */
    function viewDirectory(params) {
        var scholars = load().scholars.slice();
        var search = (params.search || '').toLowerCase();
        var perPage = 6;

        if (search) {
            scholars = scholars.filter(function (s) {
                return (s.first_name + ' ' + s.surname + ' ' + s.field_of_study + ' ' + s.email)
                    .toLowerCase().indexOf(search) !== -1;
            });
        }

        if (params.cohort) {
            scholars = scholars.filter(function (s) { return String(s.year_enrolled) === params.cohort; });
        }

        if (params.graduation_status) {
            scholars = scholars.filter(function (s) { return s.graduation_status === params.graduation_status; });
        }

        if (params.employment_status) {
            scholars = scholars.filter(function (s) { return s.employment_status === params.employment_status; });
        }

        var sort = params.sort || 'surname';
        var direction = params.direction === 'desc' ? -1 : 1;

        // Mirrors the allow-list in ProfileRepository::SORTABLE — an
        // unrecognised key falls back to the default rather than being used.
        var sortable = {
            surname: 'surname',
            year_enrolled: 'year_enrolled',
            field: 'field_of_study'
        };
        var key = sortable[sort] || 'surname';

        scholars.sort(function (a, b) {
            if (a[key] === b[key]) {
                return a.id - b.id; // stable secondary key
            }

            return (a[key] > b[key] ? 1 : -1) * direction;
        });

        var total = scholars.length;
        var pages = Math.max(1, Math.ceil(total / perPage));
        var page = Math.max(1, Math.min(parseInt(params.page, 10) || 1, pages));
        var visible = scholars.slice((page - 1) * perPage, page * perPage);

        var all = load().scholars;
        var stats = {
            total: all.length,
            graduated: all.filter(function (s) { return s.graduation_status === 'graduated'; }).length,
            current: all.filter(function (s) { return s.graduation_status === 'current_student'; }).length,
            employed: all.filter(function (s) {
                return s.employment_status === 'working' || s.employment_status === 'entrepreneurship';
            }).length
        };

        var cohorts = [];
        all.forEach(function (s) {
            if (cohorts.indexOf(s.year_enrolled) === -1) {
                cohorts.push(s.year_enrolled);
            }
        });
        cohorts.sort(function (a, b) { return b - a; });

        function url(overrides) {
            var merged = {};

            Object.keys(params).forEach(function (k) { merged[k] = params[k]; });
            Object.keys(overrides).forEach(function (k) { merged[k] = overrides[k]; });

            var pairs = Object.keys(merged)
                .filter(function (k) { return merged[k] !== '' && merged[k] !== null && merged[k] !== undefined; })
                .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(merged[k]); });

            return '#/directory' + (pairs.length ? '?' + pairs.join('&') : '');
        }

        function sortLink(k, label) {
            var active = sort === k;
            var next = active && params.direction !== 'desc' ? 'desc' : 'asc';
            var arrow = active ? (params.direction === 'desc' ? '↓' : '↑') : '';

            return '<a class="table__sort" href="' + e(url({ sort: k, direction: next, page: null })) + '"' +
                (active ? ' aria-sort="' + (params.direction === 'desc' ? 'descending' : 'ascending') + '"' : '') +
                '>' + e(label) + ' <span aria-hidden="true">' + arrow + '</span></a>';
        }

        function selectFilter(name, label, blank, map, selected) {
            var opts = '<option value="">' + e(blank) + '</option>';

            Object.keys(map).forEach(function (k) {
                opts += '<option value="' + e(k) + '"' + (selected === k ? ' selected' : '') + '>' +
                    e(map[k]) + '</option>';
            });

            return '<div class="field">' +
                '<label class="field__label" for="' + name + '">' + e(label) + '</label>' +
                '<select class="select" id="' + name + '" name="' + name + '">' + opts + '</select>' +
            '</div>';
        }

        var cohortMap = {};
        cohorts.forEach(function (c) { cohortMap[c] = c; });

        var rows = visible.map(function (s) {
            var doc = currentDocument(s);

            return '<tr>' +
                '<td><div class="table__person">' +
                    '<span class="avatar avatar--sm" aria-hidden="true">' + e(initials(s)) + '</span>' +
                    '<span><span class="table__name">' + e(fullName(s)) + '</span><br>' +
                    '<span class="table__email">' + e(s.email) + '</span></span>' +
                '</div></td>' +
                '<td>' + e(s.year_enrolled) + '</td>' +
                '<td>' + e(s.field_of_study) + '</td>' +
                '<td><span class="badge ' + (s.graduation_status === 'graduated' ? 'badge--success' : 'badge--blue') + '">' +
                    e(academicSummary(s)) + '</span></td>' +
                '<td><span class="badge badge--neutral">' + e(EMPLOYMENT_STATUSES[s.employment_status]) + '</span>' +
                    (expectsCompany(s) ? '<br><span class="table__email">' + e(companyDisplay(s)) + '</span>' : '') +
                '</td>' +
                '<td>' + (doc
                    ? '<span class="badge badge--blue">' + e(typeLabel(doc)) + '</span>'
                    : '<span class="badge badge--warning">Missing</span>') + '</td>' +
                '<td><a class="btn btn--secondary btn--sm" href="#/scholar/' + s.id + '">View</a></td>' +
            '</tr>';
        }).join('');

        var pager = '';

        if (pages > 1) {
            var links = '';

            for (var n = 1; n <= pages; n++) {
                links += '<a class="pagination__link' + (n === page ? ' is-current' : '') + '" href="' +
                    e(url({ page: n })) + '"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</a>';
            }

            pager = '<nav class="pagination" aria-label="Directory pages">' +
                '<span class="subtle">Showing page ' + page + ' of ' + pages + '</span>' +
                '<div class="pagination__pages">' + links + '</div></nav>';
        }

        var table = total === 0
            ? '<div class="card mt-32"><div class="empty">' +
                '<h2>No scholars match those filters</h2>' +
                '<p>Try a broader search, or clear the filters to see every record.</p>' +
                '<a class="btn btn--secondary" href="#/directory">Clear filters</a>' +
              '</div></div>'
            : '<p class="subtle mt-32">' + total + (total === 1 ? ' scholar' : ' scholars') +
              (pages > 1 ? ' · page ' + page + ' of ' + pages : '') + '</p>' +
              '<div class="table-wrap mt-16"><table class="table"><thead><tr>' +
                '<th scope="col">' + sortLink('surname', 'Scholar') + '</th>' +
                '<th scope="col">' + sortLink('year_enrolled', 'Cohort') + '</th>' +
                '<th scope="col">' + sortLink('field', 'Field of study') + '</th>' +
                '<th scope="col">Status</th><th scope="col">Employment</th>' +
                '<th scope="col">Results</th><th scope="col"><span class="visually-hidden">Actions</span></th>' +
              '</tr></thead><tbody>' + rows + '</tbody></table></div>' + pager;

        return '<div class="shell">' +
            '<div class="section__head">' +
                '<p class="eyebrow">Administration</p>' +
                '<h1 class="display-2">Scholar directory</h1>' +
                '<p>Search, review and update every scholar record in the programme.</p>' +
            '</div>' +
            '<div class="stat-grid mt-32">' +
                '<div class="stat"><p class="stat__label">Total scholars</p><p class="stat__value">' + stats.total + '</p></div>' +
                '<div class="stat"><p class="stat__label">Graduated</p><p class="stat__value">' + stats.graduated + '</p></div>' +
                '<div class="stat"><p class="stat__label">Current students</p><p class="stat__value">' + stats.current + '</p></div>' +
                '<div class="stat"><p class="stat__label">Working or founding</p><p class="stat__value">' + stats.employed + '</p></div>' +
            '</div>' +
            '<form class="card mt-32" data-demo-filters><div class="card__body"><div class="filters">' +
                '<div class="field">' +
                    '<label class="field__label" for="search">Search</label>' +
                    '<input class="input" type="search" id="search" name="search" ' +
                        'placeholder="Name, field of study or e-mail" value="' + e(params.search || '') + '">' +
                '</div>' +
                selectFilter('cohort', 'Cohort', 'All years', cohortMap, params.cohort || '') +
                selectFilter('graduation_status', 'Status', 'All statuses', GRADUATION_STATUSES, params.graduation_status || '') +
                selectFilter('employment_status', 'Employment', 'All', EMPLOYMENT_STATUSES, params.employment_status || '') +
                '<div class="row">' +
                    '<button class="btn btn--primary" type="submit">Apply</button>' +
                    '<a class="btn btn--ghost" href="#/directory">Reset</a>' +
                '</div>' +
            '</div></div></form>' + table +
        '</div>';
    }

    function viewNotFound() {
        return '<div class="shell"><div class="card"><div class="empty">' +
            '<p class="eyebrow">Error 404</p>' +
            '<h2 class="mt-8">Page not found</h2>' +
            '<p>The page you were looking for is not here.</p>' +
            '<a class="btn btn--primary" href="#/">Back to the start</a>' +
        '</div></div></div>';
    }

    /* ===============================================================
     | Re-running the application's own form scripts
     |================================================================ */

    /**
     * Load validation.js and upload.js against the form just rendered.
     *
     * Both are IIFEs that bind on execution, so they must run AFTER the
     * form is in the DOM — and again on every re-render. Appending a fresh
     * <script> element executes the file even when it is already cached;
     * the element is removed afterwards to avoid accumulating dead nodes.
     *
     * `next` runs once both have executed, which is when the demo's own
     * submit handler can safely be attached — it needs to run after
     * validation.js's handler so it can read event.defaultPrevented.
     */
    function mountProfileScripts(next) {
        var sources = ['assets/js/validation.js', 'assets/js/upload.js'];
        var remaining = sources.length;

        sources.forEach(function (src) {
            var script = document.createElement('script');

            script.src = src;
            script.async = false; // preserve execution order

            script.onload = script.onerror = function () {
                script.remove();
                remaining -= 1;

                if (remaining === 0) {
                    next();
                }
            };

            document.body.appendChild(script);
        });
    }

    /* ===============================================================
     | Saving
     |================================================================ */

    function readForm(form) {
        function value(name) {
            var input = form.querySelector('[name="' + name + '"]');

            return input ? input.value.replace(/[\s ]+/g, ' ').trim() : '';
        }

        var employment = value('employment_status');
        var undisclosedInput = form.querySelector('[name="company_undisclosed"]');
        var undisclosed = Boolean(undisclosedInput && undisclosedInput.checked);
        var relevant = CONFIG.companyStatuses.indexOf(employment) !== -1;

        return {
            first_name: value('first_name'),
            surname: value('surname'),
            year_enrolled: parseInt(value('year_enrolled'), 10),
            graduation_year: value('graduation_year') ? parseInt(value('graduation_year'), 10) : null,
            graduation_status: value('graduation_status'),
            field_of_study: value('field_of_study'),
            employment_status: employment,

            // Mirrors ProfileValidator::validateCompany(): the name is
            // DISCARDED — not merely hidden — when the status has no
            // company or the scholar withheld it.
            company_name: (relevant && !undisclosed) ? (value('company_name') || null) : null,
            company_undisclosed: relevant ? undisclosed : false
        };
    }

    function applyUpload(form, scholar) {
        var input = form.querySelector('[name="academic_results"]');

        if (!input || !input.files || input.files.length === 0) {
            return; // no new file: keep whatever is on record
        }

        var file = input.files[0];

        // Supersede rather than replace, exactly as the real service does,
        // so the previous version stays in the history.
        scholar.documents.forEach(function (item) { item.current = false; });

        scholar.documents.push({
            id: Date.now(),
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            uploaded_at: new Date().toISOString().slice(0, 10),
            current: true
        });
    }

    function handleSubmit(form, scholar, isAdminEditing) {
        var data = readForm(form);

        if (scholar) {
            Object.keys(data).forEach(function (key) { scholar[key] = data[key]; });
            scholar.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
            applyUpload(form, scholar);
            flash('success', 'Profile updated.');
        } else {
            var store = load();

            scholar = {
                id: store.nextId++,
                email: (data.first_name + '.' + data.surname).toLowerCase() + '@example.org',
                documents: [],
                updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };

            Object.keys(data).forEach(function (key) { scholar[key] = data[key]; });
            applyUpload(form, scholar);

            store.scholars.push(scholar);
            store.session.scholarId = scholar.id;
            flash('success', 'Your profile is set up.');
        }

        save();
        go(isAdminEditing ? '/scholar/' + scholar.id : '/profile');
    }

    /* ===============================================================
     | Render
     |================================================================ */

    function render() {
        var view = document.querySelector('[data-demo-view]');
        var params = queryParams();
        var path = route();
        var session = currentUser();
        var html;
        var afterRender = null;

        // --- Routes needing a session -------------------------------
        if ((path === '/profile' || path === '/edit' || path === '/directory' ||
             path.indexOf('/scholar/') === 0) && !session) {
            flash('info', 'Please choose a demo account to continue.');
            window.location.hash = '/login';

            return;
        }

        var scholarMatch = path.match(/^\/scholar\/(\d+)(\/edit)?$/);

        if (path === '/') {
            html = viewHome();
        } else if (path === '/login') {
            html = viewLogin();
        } else if (path === '/profile') {
            html = viewProfile(myScholar(), false);
        } else if (path === '/edit') {
            var mine = myScholar();
            html = viewForm(mine, false);
            afterRender = function (form) { handleSubmit(form, mine, false); };
        } else if (path === '/directory') {
            html = isAdmin()
                ? viewDirectory(params)
                : '<div class="shell"><div class="card"><div class="empty">' +
                  '<p class="eyebrow">Error 403</p><h2 class="mt-8">Not allowed</h2>' +
                  '<p>The directory is for programme administrators. Sign in as the ' +
                  'administrator account to see it.</p>' +
                  '<a class="btn btn--primary" href="#/login">Switch account</a></div></div></div>';
        } else if (scholarMatch) {
            var target = findScholar(scholarMatch[1]);

            if (!target) {
                html = viewNotFound();
            } else if (scholarMatch[2]) {
                html = viewForm(target, true);
                afterRender = function (form) { handleSubmit(form, target, true); };
            } else {
                html = viewProfile(target, isAdmin());
            }
        } else {
            html = viewNotFound();
        }

        view.innerHTML = html;
        renderChrome();
        renderFlash();
        window.scrollTo(0, 0);

        var form = view.querySelector('[data-profile-form]');

        if (form && afterRender) {
            mountProfileScripts(function () {
                /*
                 * Attached AFTER validation.js, so its listener runs first.
                 * When validation fails it calls preventDefault(), which is
                 * visible here as event.defaultPrevented — so this handler
                 * can simply stand down and let the real validator own the
                 * decision, rather than duplicating its rules.
                 */
                form.addEventListener('submit', function (event) {
                    if (event.defaultPrevented) {
                        var summary = view.querySelector('[data-demo-error-summary]');

                        if (summary) {
                            summary.hidden = false;
                        }

                        return;
                    }

                    event.preventDefault();
                    afterRender(form);
                });
            });
        }
    }

    /* ===============================================================
     | Events
     |================================================================ */

    window.addEventListener('hashchange', render);

    // Delegated, because every view is replaced wholesale on render.
    document.addEventListener('click', function (event) {
        var signIn = event.target.closest('[data-demo-signin]');

        if (signIn) {
            var id = signIn.getAttribute('data-demo-signin');
            var store = load();

            store.session = id === 'admin'
                ? { email: 'admin@westscholars.org', role: 'admin', scholarId: null }
                : { email: findScholar(id).email, role: 'scholar', scholarId: parseInt(id, 10) };

            save();
            flash('success', 'Signed in for the demo.');
            go(id === 'admin' ? '/directory' : '/profile');

            return;
        }

        if (event.target.closest('[data-demo-signout]')) {
            load().session = null;
            save();
            flash('success', 'Signed out.');
            go('/');

            return;
        }

        if (event.target.closest('[data-demo-reset]')) {
            reset();
            flash('info', 'Demo data reset.');
            go('/');

            return;
        }

        if (event.target.closest('[data-demo-download]')) {
            // There is no file: only its name and size were ever recorded.
            flash('info', 'Downloads need the PHP application — this demo stores no files.');
            renderFlash();
        }
    });

    // The filter form builds a hash URL rather than submitting anywhere.
    document.addEventListener('submit', function (event) {
        var filters = event.target.closest('[data-demo-filters]');

        if (!filters) {
            return;
        }

        event.preventDefault();

        var pairs = [];

        ['search', 'cohort', 'graduation_status', 'employment_status'].forEach(function (name) {
            var input = filters.querySelector('[name="' + name + '"]');

            if (input && input.value) {
                pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(input.value));
            }
        });

        go('/directory' + (pairs.length ? '?' + pairs.join('&') : ''));
    });

    if (!window.location.hash) {
        window.location.hash = '/';
    }

    render();
})();
