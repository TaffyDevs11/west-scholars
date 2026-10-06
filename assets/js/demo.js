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
        // Attachment statuses that require a host company and a start date.
        attachmentStatuses: ['in_progress', 'completed']
    };

    // Mirrors ProfileValidator::GRADUATION_STATUSES / EMPLOYMENT_STATUSES.
    var GRADUATION_STATUSES = {
        graduated: 'Graduated',
        current_student: 'Current Student'
    };

    /*
     * 'Student' was retired: a scholar who is studying and not working has
     * no job, which 'No job' already says. Carrying both made the directory
     * filter ambiguous.
     */
    var EMPLOYMENT_STATUSES = {
        no_job: 'No job',
        entrepreneurship: 'Entrepreneurship',
        working: 'Working'
    };

    // Mirrors ProfileValidator::ATTACHMENT_STATUSES.
    var ATTACHMENT_STATUSES = {
        not_applicable: 'N/A',
        in_progress: 'In progress',
        completed: 'Completed'
    };

    // Bumped when the stored shape changes, so a returning visitor with an
    // older record in localStorage gets a fresh seed rather than a page that
    // breaks on a missing field.
    var STORAGE_KEY = 'west-scholars-demo-v3';

    /* ===============================================================
     | Seed data
     |================================================================
     | The same cohort the README's screenshots show, so the directory
     | has something meaningful in it on a first visit.
     */

    function seedScholars() {
        return [
            row(1, 'Tendai', 'Moyo', 2019, 2023, 'graduated', 'Civil Engineering', 'working',
                'transcript-2023.pdf', 'completed', 'Econet Wireless', '2021-06-07', '2021-12-10',
                '+263 77 101 2020', 'tendai.moyo@gmail.com', true, false,
                [['Bridgeworks Ltd', 'Site Engineer', 2024, null], ['Econet Wireless', 'Graduate trainee', 2023, 2024]]),

            row(2, 'Anna', 'Ncube', 2020, null, 'current_student', 'Medicine', 'no_job',
                'results-sem2.pdf', 'in_progress', 'Parirenyatwa Hospital', '2026-01-12', null,
                '+263 71 334 5566', 'anna.ncube@gmail.com', true, false, []),

            row(3, 'Farai', 'Chirwa', 2019, 2023, 'graduated', 'Computer Science', 'entrepreneurship',
                'final-transcript.pdf', 'completed', 'Liquid Intelligent Technologies', '2021-07-05', '2022-01-05',
                '+263 77 889 1200', 'farai.chirwa@gmail.com', true, false,
                [['Chirwa Labs', 'Founder', 2023, null], ['Mega Market', 'Graduate trainee', 2021, 2023]]),

            row(4, 'Rudo', 'Banda', 2021, null, 'current_student', 'Law', 'no_job',
                null, 'not_applicable', null, null, null,
                null, null, true, false, []),

            // Opted out of sharing both contact details and employers, so the
            // demo shows what a withheld record looks like to a peer.
            row(5, 'Kuda', 'Zimuto', 2018, 2022, 'graduated', 'Computer Science', 'working',
                'degree-results.pdf', 'completed', 'Old Mutual', '2020-06-01', '2020-12-01',
                '+263 78 445 9911', 'kuda.zimuto@gmail.com', false, true,
                [['Old Mutual', 'Systems Analyst', 2022, null]]),

            row(6, 'Chipo', 'Dube', 2022, null, 'current_student', 'Accounting', 'no_job',
                'year1-results.png', 'not_applicable', null, null, null,
                null, null, true, false, []),

            row(7, 'Nyasha', 'Sibanda', 2020, 2024, 'graduated', 'Medicine', 'working',
                'mbchb-transcript.pdf', 'completed', 'Harare Central Hospital', '2022-02-14', '2022-08-14',
                '+263 77 220 3344', 'nyasha.sibanda@gmail.com', true, false,
                [['Parirenyatwa Group', 'Medical Officer', 2024, null]]),

            row(8, 'Tapiwa', 'Mutasa', 2021, null, 'current_student', 'Electrical Engineering', 'no_job',
                null, 'in_progress', 'ZESA Holdings', '2026-02-02', null,
                null, null, true, false, []),

            // The example the programme asked for, verbatim.
            row(9, 'Kudzaishe', 'Muteme', 2018, 2022, 'graduated', 'Mining Engineering', 'working',
                'transcript.pdf', 'completed', 'Unki Mine', '2021-05-10', '2021-11-10',
                '+263 71 552 8080', 'kudzaishe.muteme@gmail.com', true, false,
                [['Unki Mine', 'Junior Engineer', 2025, null], ['Mega Market', 'Graduate trainee', 2023, 2025]])
        ];
    }

    /** Announcements the administrator has posted. */
    function seedAnnouncements() {
        var today = new Date();
        var recent = new Date(today.getTime() - 2 * 86400000).toISOString().slice(0, 10);
        var older = new Date(today.getTime() - 26 * 86400000).toISOString().slice(0, 10);

        return [
            {
                id: 1,
                title: 'Termly scholars meeting — Saturday 14 March',
                body: 'The termly meeting is on Saturday 14 March at 10am in the Harare office.\n\n'
                    + 'Please bring your latest results slip. Alumni are very welcome — this is '
                    + 'the best chance of the term to meet the new intake.',
                is_pinned: true,
                published_at: recent,
                author: 'admin@westscholars.org'
            },
            {
                id: 2,
                title: 'Attachment placements now open',
                body: 'Placement applications for the coming year open on Monday.\n\n'
                    + 'Update the attachment section of your profile once you have accepted a '
                    + 'placement, so the programme can keep track of where everyone is.',
                is_pinned: false,
                published_at: recent,
                author: 'admin@westscholars.org'
            },
            {
                id: 3,
                title: 'Results deadline reminder',
                body: 'Please upload your end-of-year results before the end of the month.\n\n'
                    + 'Your results are visible only to you and to programme administrators — '
                    + 'they are never shown to other scholars in the directory.',
                is_pinned: false,
                published_at: older,
                author: 'admin@westscholars.org'
            }
        ];
    }

    function row(id, first, last, enrolled, graduated, status, field, employment,
                 document, attachmentStatus, attachmentCompany, attachmentStart, attachmentEnd,
                 phone, personalEmail, contactVisible, employmentUndisclosed, career) {
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
            employment_undisclosed: employmentUndisclosed,
            attachment_status: attachmentStatus,
            attachment_company: attachmentCompany,
            attachment_start: attachmentStart,
            attachment_end: attachmentEnd,
            phone: phone,
            personal_email: personalEmail,
            contact_visible: contactVisible,

            // [company, job title, start year, end year] - a null end year
            // means "to present", which is what identifies the current role.
            career: (career || []).map(function (entry, index) {
                return {
                    id: id * 100 + index,
                    company: entry[0],
                    job_title: entry[1],
                    start_year: entry[2],
                    end_year: entry[3]
                };
            }),

            updated_at: '2026-10-0' + ((id % 9) + 1) + ' 10:00:00',
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

                // Both keys must be present, or an older stored shape would
                // be loaded into code that now expects announcements too.
                if (state && state.scholars && state.announcements) {
                    return state;
                }
            }
        } catch (error) {
            /* Unavailable or corrupt — fall through to a fresh seed. */
        }

        state = {
            scholars: seedScholars(),
            announcements: seedAnnouncements(),
            session: null,
            nextId: 10,
            nextAnnouncementId: 4
        };
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

    /**
     * Collapse whitespace and trim — the mirror of Str::clean() in PHP.
     *
     * Note this is NOT used on an announcement body: collapsing whitespace
     * there would destroy the paragraph breaks the notice is written with.
     */
    function clean(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/[\s ]+/g, ' ')
            .trim();
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

    /** The open-ended role IS the current one. */
    function currentRole(scholar) {
        var career = scholar.career || [];

        for (var i = 0; i < career.length; i++) {
            if (career[i].end_year === null || career[i].end_year === undefined) {
                return career[i];
            }
        }

        return null;
    }

    /** Newest first, with the current role leading. */
    function sortedCareer(scholar) {
        return (scholar.career || []).slice().sort(function (a, b) {
            var aCurrent = a.end_year === null || a.end_year === undefined;
            var bCurrent = b.end_year === null || b.end_year === undefined;

            if (aCurrent !== bCurrent) {
                return aCurrent ? -1 : 1;
            }

            return b.start_year - a.start_year;
        });
    }

    function rolePeriod(role) {
        var end = (role.end_year === null || role.end_year === undefined) ? 'present' : role.end_year;

        return role.start_year + ' to ' + end;
    }

    function roleSummary(role) {
        return role.job_title + ' at ' + role.company;
    }

    /**
     * The career history as this viewer may see it.
     *
     * Unlike the old single company field, which was discarded outright when
     * withheld, the records are always kept - the scholar and the programme
     * need them. They are simply not shown to anyone else.
     */
    function careerVisibleTo(scholar) {
        var session = currentUser();

        if (!session) {
            return [];
        }

        if (session.role === 'admin' || session.scholarId === scholar.id) {
            return sortedCareer(scholar);
        }

        return scholar.employment_undisclosed ? [] : sortedCareer(scholar);
    }

    /** What the directory's Employment cell shows. */
    function employmentDisplay(scholar) {
        if (scholar.employment_undisclosed) {
            return 'Prefer not to disclose';
        }

        var current = currentRole(scholar);

        if (current) {
            return roleSummary(current);
        }

        var sorted = sortedCareer(scholar);

        if (sorted.length) {
            return 'Previously ' + roleSummary(sorted[0]);
        }

        return scholar.employment_status === 'no_job' ? 'Not working' : 'Not provided';
    }

    /** The personal address when given; the sign-in one otherwise. */
    function bestEmail(scholar) {
        return scholar.personal_email || scholar.email;
    }

    function attachmentPeriod(scholar) {
        var start = formatDate(scholar.attachment_start);

        if (!start) {
            return '';
        }

        var end = formatDate(scholar.attachment_end);

        if (end) {
            return start + ' to ' + end;
        }

        return scholar.attachment_status === 'in_progress' ? start + ' to present' : start;
    }

    function hasAttachment(scholar) {
        return CONFIG.attachmentStatuses.indexOf(scholar.attachment_status) !== -1;
    }

    function attachmentLabel(scholar) {
        return ATTACHMENT_STATUSES[scholar.attachment_status] || 'N/A';
    }

    /** "7 June 2021", or '' when there is no date. */
    function formatDate(value) {
        if (!value) {
            return '';
        }

        var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        if (!parts) {
            return value;
        }

        var months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

        return parseInt(parts[3], 10) + ' ' + months[parseInt(parts[2], 10) - 1] + ' ' + parts[1];
    }

    /**
     * May the viewer see this scholar's phone number and e-mail?
     *
     * Mirrors ProfileRepository::applyContactVisibility(). In the real
     * application the withholding happens in the data layer, so the values
     * never reach the page at all; here the check is made at render time,
     * which is the closest a browser-only demo can get.
     */
    function contactVisibleTo(scholar) {
        var session = currentUser();

        if (!session) {
            return false;
        }

        if (session.role === 'admin' || session.scholarId === scholar.id) {
            return true;
        }

        return Boolean(scholar.contact_visible);
    }

    /** May the viewer see this scholar's academic results? */
    function canSeeResults(scholar) {
        var session = currentUser();

        return Boolean(session && (session.role === 'admin' || session.scholarId === scholar.id));
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

        /*
         * The directory and the announcements are open to every member - the
         * programme uses them as a networking platform - so both appear for
         * scholars as well as administrators.
         */
        nav.innerHTML =
            (session.role === 'admin' ? '' : link('/profile', 'My profile', '/profile')) +
            link('/directory', 'Scholars', '/directory') +
            link('/announcements', 'Announcements', '/announcements') +
            (session.role === 'admin' ? '' : link('/edit', 'Edit profile', '/edit'));

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
            ['3', 'Career history', 'Every role so far — "Graduate trainee, 2023 to 2025".'],
            ['4', 'Industrial attachment', 'Where you were placed, and when it ran.'],
            ['5', 'Contact details', 'How other scholars can reach you, if you choose.'],
            ['6', 'Academic results', 'A PDF or photo of your latest transcript.']
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
                    '<h2 class="display-2">Six short sections</h2>' +
                    '<p>Most scholars complete this in a few minutes. Everything except your ' +
                    'academic results can be changed later.</p>' +
                '</div>' +
                '<div class="stat-grid">' + cards + '</div>' +
            '</section>' +
            '<section class="section">' +
                '<div class="section__head">' +
                    '<p class="eyebrow">Once you are in</p>' +
                    '<h2 class="display-2">More than a form</h2>' +
                '</div>' +
                '<div class="stat-grid">' +
                    '<div class="stat">' +
                        '<p class="eyebrow">Announcements</p>' +
                        '<p class="heading mt-8">Meetings and programme news</p>' +
                        '<p class="muted mt-8" style="font-size:14.5px">Meeting dates, deadlines and ' +
                        'news from the programme, pinned so the important ones stay at the top.</p>' +
                    '</div>' +
                    '<div class="stat">' +
                        '<p class="eyebrow">Scholar directory</p>' +
                        '<p class="heading mt-8">Find scholars and alumni</p>' +
                        '<p class="muted mt-8" style="font-size:14.5px">Search by name, field or employer, ' +
                        'and get in touch with those who share their details.</p>' +
                    '</div>' +
                    '<div class="stat">' +
                        '<p class="eyebrow">Career history</p>' +
                        '<p class="heading mt-8">Follow the whole path</p>' +
                        '<p class="muted mt-8" style="font-size:14.5px">Every role, not just the current ' +
                        'one — so you can see how careers actually unfold.</p>' +
                    '</div>' +
                '</div>' +
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
        var undisclosed = scholar ? scholar.employment_undisclosed : false;
        var document_ = scholar ? currentDocument(scholar) : null;

        // Stored roles plus one spare, so there is somewhere to type the next.
        var careerRows = scholar ? sortedCareer(scholar).map(function (r) {
            return {
                company: r.company,
                job_title: r.job_title,
                start_year: r.start_year,
                end_year: (r.end_year === null || r.end_year === undefined) ? '' : r.end_year
            };
        }) : [];

        careerRows.push({ company: '', job_title: '', start_year: '', end_year: '' });

        var attachment = scholar ? scholar.attachment_status : 'not_applicable';
        var showAttachment = CONFIG.attachmentStatuses.indexOf(attachment) !== -1;

        // Ticked by default for a new profile: the directory exists to
        // connect people, and the phone field starts empty so nothing is
        // shared until one is deliberately entered.
        var contactVisible = scholar ? Boolean(scholar.contact_visible) : true;

        /**
         * Build <option> markup.
         *
         * `blank` is the placeholder row; passing null omits it, which is
         * what the attachment select needs - "N/A" is a real answer there,
         * not an absence, so there is nothing to prompt for.
         */
        function options(map, selected, blank) {
            var html = blank === null ? '' : '<option value="">' + e(blank || 'Select status…') + '</option>';

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
                'data-attachment-statuses="' + e(CONFIG.attachmentStatuses.join(',')) + '" ' +
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
                        '<span class="fieldset__title">Employment &amp; career</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">Every role so far, not just the current one &mdash; ' +
                    'leave the end year blank for the job you are in now.</p>' +
                    '<div class="field-grid">' +
                        '<div class="field field--full">' +
                            '<label class="field__label" for="employment_status">Employment status ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<select class="select" id="employment_status" name="employment_status">' +
                                options(EMPLOYMENT_STATUSES, employment) +
                            '</select>' +
                            '<p class="field__error" id="employment_status-error"></p>' +
                        '</div>' +
                    '</div>' +

                    '<div class="career mt-24" data-career>' +
                        '<div class="row row--between">' +
                            '<p class="field__label">Roles</p>' +
                            '<span class="subtle">Leave the end year blank for your current job</span>' +
                        '</div>' +
                        '<div class="career__rows mt-8" data-career-rows>' +
                            careerRows.map(function (r, i) {
                                return '<div class="career__row" data-career-row>' +
                                    '<div class="career__fields">' +
                                        '<input class="input" type="text" name="career[' + i + '][company]" ' +
                                            'maxlength="150" placeholder="Company" value="' + e(r.company) + '">' +
                                        '<input class="input" type="text" name="career[' + i + '][job_title]" ' +
                                            'maxlength="150" placeholder="Job title" value="' + e(r.job_title) + '">' +
                                        '<input class="input" type="number" name="career[' + i + '][start_year]" ' +
                                            'min="' + CONFIG.yearMin + '" max="' + CONFIG.yearMax + '" ' +
                                            'placeholder="From" value="' + e(r.start_year) + '">' +
                                        '<input class="input" type="number" name="career[' + i + '][end_year]" ' +
                                            'min="' + CONFIG.yearMin + '" max="' + CONFIG.yearMax + '" ' +
                                            'placeholder="To (blank = present)" value="' + e(r.end_year) + '">' +
                                        '<button class="btn btn--ghost btn--sm career__remove" type="button" ' +
                                            'data-career-remove aria-label="Remove this role">&times;</button>' +
                                    '</div>' +
                                '</div>';
                            }).join('') +
                        '</div>' +
                        '<button class="btn btn--secondary btn--sm mt-8" type="button" data-career-add>' +
                            '+ Add another role</button>' +
                        '<p class="field__error mt-8" id="career-error"></p>' +
                    '</div>' +

                    '<div class="field field--full mt-16">' +
                        '<label class="checkbox">' +
                            '<input type="checkbox" id="employment_undisclosed" name="employment_undisclosed" ' +
                                'value="1"' + (undisclosed ? ' checked' : '') + '>' +
                            '<span class="checkbox__text">' +
                                '<strong>Prefer not to disclose my employers</strong>' +
                                '<span>Your career history stays on your record and stays visible to you ' +
                                'and to programme administrators, but other scholars will not see it.</span>' +
                            '</span>' +
                        '</label>' +
                    '</div>' +
                '</fieldset>' +

                // --- 4. Industrial attachment ---------------------------
                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">4</span>' +
                        '<span class="fieldset__title">Industrial attachment</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">Your work placement, if you have one. ' +
                    'Tracked separately from employment &mdash; an attachment is part of your studies.</p>' +
                    '<div class="field-grid">' +
                        '<div class="field">' +
                            '<label class="field__label" for="attachment_status">Attachment status</label>' +
                            '<select class="select" id="attachment_status" name="attachment_status">' +
                                options(ATTACHMENT_STATUSES, attachment, null) +
                            '</select>' +
                            '<p class="field__hint">Choose N/A if you have not been on attachment.</p>' +
                            '<p class="field__error" id="attachment_status-error"></p>' +
                        '</div>' +

                        '<div class="field" data-attachment-field' + (showAttachment ? '' : ' hidden') + '>' +
                            '<label class="field__label" for="attachment_company">Company attached to ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<input class="input" type="text" id="attachment_company" name="attachment_company" ' +
                                'maxlength="150" placeholder="Where you are placed" value="' +
                                e(scholar && scholar.attachment_company ? scholar.attachment_company : '') + '">' +
                            '<p class="field__error" id="attachment_company-error"></p>' +
                        '</div>' +

                        '<div class="field" data-attachment-start-field' + (showAttachment ? '' : ' hidden') + '>' +
                            '<label class="field__label" for="attachment_start">Attachment start date ' +
                            '<span class="field__required" aria-hidden="true">*</span></label>' +
                            '<input class="input" type="date" id="attachment_start" name="attachment_start" ' +
                                'min="' + CONFIG.yearMin + '-01-01" max="' + CONFIG.yearMax + '-12-31" value="' +
                                e(scholar && scholar.attachment_start ? scholar.attachment_start : '') + '">' +
                            '<p class="field__error" id="attachment_start-error"></p>' +
                        '</div>' +

                        '<div class="field" data-attachment-end-field' + (showAttachment ? '' : ' hidden') + '>' +
                            '<label class="field__label" for="attachment_end">Attachment end date ' +
                            '<span class="field__required" data-attachment-end-required aria-hidden="true"' +
                                (attachment === 'completed' ? '' : ' hidden') + '>*</span></label>' +
                            '<input class="input" type="date" id="attachment_end" name="attachment_end" ' +
                                'min="' + CONFIG.yearMin + '-01-01" max="' + CONFIG.yearMax + '-12-31" value="' +
                                e(scholar && scholar.attachment_end ? scholar.attachment_end : '') + '">' +
                            '<p class="field__hint" data-attachment-end-hint>' +
                                (attachment === 'completed'
                                    ? 'Required - the date the placement finished.'
                                    : 'Leave blank if you are still there.') + '</p>' +
                            '<p class="field__error" id="attachment_end-error"></p>' +
                        '</div>' +
                    '</div>' +
                '</fieldset>' +

                // --- 5. Contact & networking ----------------------------
                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">5</span>' +
                        '<span class="fieldset__title">Contact &amp; networking</span>' +
                    '</legend>' +
                    '<p class="fieldset__hint">The directory lets scholars and alumni reach each other. ' +
                    'You choose whether your details appear there.</p>' +
                    '<div class="field-grid">' +
                        '<div class="field">' +
                            '<label class="field__label" for="phone">Phone number ' +
                            '<span class="field__optional">optional</span></label>' +
                            '<input class="input" type="tel" id="phone" name="phone" maxlength="30" ' +
                                'placeholder="+263 77 123 4567" value="' +
                                e(scholar && scholar.phone ? scholar.phone : '') + '">' +
                            '<p class="field__error" id="phone-error"></p>' +
                        '</div>' +
                        '<div class="field">' +
                            '<label class="field__label" for="personal_email">Personal e-mail ' +
                            '<span class="field__optional">optional</span></label>' +
                            '<input class="input" type="email" id="personal_email" name="personal_email" ' +
                                'maxlength="255" placeholder="you@gmail.com" value="' +
                                e(scholar && scholar.personal_email ? scholar.personal_email : '') + '">' +
                            '<p class="field__hint">An address that will outlast your student one.</p>' +
                            '<p class="field__error" id="personal_email-error"></p>' +
                        '</div>' +
                        '<div class="field field--full">' +
                            '<label class="checkbox">' +
                                '<input type="checkbox" id="contact_visible" name="contact_visible" value="1"' +
                                    (contactVisible ? ' checked' : '') + '>' +
                                '<span class="checkbox__text">' +
                                    '<strong>Share my contact details with other scholars</strong>' +
                                    '<span>Your phone number and e-mail address appear in the scholar ' +
                                    'directory so others can get in touch. Untick this and only you and ' +
                                    'programme administrators can see them. Your academic results are ' +
                                    'never shared either way.</span>' +
                                '</span>' +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                '</fieldset>' +

                // --- 6. Academic results --------------------------------
                '<fieldset class="fieldset">' +
                    '<legend class="fieldset__legend">' +
                        '<span class="fieldset__number" aria-hidden="true">6</span>' +
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

        var session = currentUser();
        var isOwn = Boolean(session && session.scholarId === scholar.id);
        var maySeeResults = canSeeResults(scholar);
        var maySeeContact = contactVisibleTo(scholar);

        var documents = maySeeResults ? scholar.documents.slice().reverse() : [];
        var current = maySeeResults ? currentDocument(scholar) : null;

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
                (isOwn ? '<a class="btn btn--secondary btn--sm" href="#/edit">Upload now</a>' : '') +
              '</div></div></div>';

        /*
         * Another scholar is looking. They are told the section exists and
         * why it is empty - but not whether a transcript has been uploaded,
         * because even that is between the scholar and the programme.
         */
        if (!maySeeResults) {
            docsHtml = '<div class="card"><div class="card__body"><div class="row">' +
                '<span class="file-chip__badge" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
                    'stroke-width="1.8" stroke-linecap="round">' +
                    '<rect x="4" y="10" width="16" height="10" rx="2"/>' +
                    '<path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>' +
                '</span>' +
                '<span class="grow">' +
                    '<span class="file-chip__name">Confidential</span>' +
                    '<span class="file-chip__detail">Academic results are visible only to the ' +
                    'scholar and to programme administrators.</span>' +
                '</span>' +
            '</div></div></div>';
        }

        var visibleCareer = careerVisibleTo(scholar);

        return '<div class="shell">' +
            (isOwn ? '' : '<a class="btn btn--ghost btn--sm" href="#/directory">&larr; Back to directory</a>') +
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
                (isAdminView
                    ? '<a class="btn btn--primary" href="#/scholar/' + scholar.id + '/edit">Edit profile</a>'
                    : isOwn
                        ? '<a class="btn btn--primary" href="#/edit">Edit profile</a>'
                        : (maySeeContact && bestEmail(scholar)
                            ? '<a class="btn btn--primary" href="mailto:' + e(bestEmail(scholar)) + '">Get in touch</a>'
                            : '')) +
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

            // --- Career -------------------------------------------------
            '<section class="section" style="margin-top:40px">' +
                '<div class="row row--between" style="margin-bottom:16px">' +
                    '<h2 class="heading">Career</h2>' +
                    '<span class="badge badge--neutral">' +
                        e(EMPLOYMENT_STATUSES[scholar.employment_status] || '') + '</span>' +
                '</div>' +
                (visibleCareer.length
                    ? '<ol class="timeline">' + visibleCareer.map(function (role) {
                        var isNow = role.end_year === null || role.end_year === undefined;

                        return '<li class="timeline__item' + (isNow ? ' timeline__item--current' : '') + '">' +
                            '<span class="timeline__marker" aria-hidden="true"></span>' +
                            '<div class="timeline__body">' +
                                '<p class="timeline__role">' + e(role.job_title) +
                                    (isNow ? ' <span class="badge badge--success">Current</span>' : '') +
                                '</p>' +
                                '<p class="timeline__company">' + e(role.company) + '</p>' +
                                '<p class="timeline__period">' + e(rolePeriod(role)) + '</p>' +
                            '</div>' +
                        '</li>';
                      }).join('') + '</ol>'
                    : '<div class="card"><div class="card__body"><p class="muted">' +
                      (scholar.employment_undisclosed && !isOwn && !isAdminView
                        ? 'This scholar has chosen not to share their employment history.'
                        : 'No roles have been added yet.') +
                      '</p></div></div>') +
            '</section>' +

            // --- Industrial attachment ------------------------------
            '<section class="section" style="margin-top:40px">' +
                '<h2 class="heading" style="margin-bottom:16px">Industrial attachment</h2>' +
                '<div class="detail-grid">' +
                    detail('Attachment status', attachmentLabel(scholar), !hasAttachment(scholar)) +
                    (hasAttachment(scholar)
                        ? detail('Company', scholar.attachment_company || 'Not provided', !scholar.attachment_company) +
                          detail('Period', attachmentPeriod(scholar) || 'Not set', !scholar.attachment_start)
                        : '') +
                '</div>' +
            '</section>' +

            // --- Contact --------------------------------------------
            '<section class="section" style="margin-top:40px">' +
                '<div class="row row--between" style="margin-bottom:16px">' +
                    '<h2 class="heading">Contact</h2>' +
                    (isOwn
                        ? '<span class="badge ' + (scholar.contact_visible ? 'badge--success' : 'badge--neutral') + '">' +
                          (scholar.contact_visible ? 'Shared with other scholars' : 'Visible only to you and administrators') +
                          '</span>'
                        : '') +
                '</div>' +
                (maySeeContact && (bestEmail(scholar) || scholar.phone)
                    ? '<div class="detail-grid">' +
                        (scholar.personal_email ? '<div class="detail"><p class="detail__label">Personal e-mail</p>' +
                            '<p class="detail__value"><a href="mailto:' + e(scholar.personal_email) + '">' +
                            e(scholar.personal_email) + '</a></p></div>' : '') +
                        (scholar.email && scholar.email !== scholar.personal_email
                            ? '<div class="detail"><p class="detail__label">' +
                              (isOwn || isAdminView ? 'Account e-mail' : 'E-mail') + '</p>' +
                              '<p class="detail__value"><a href="mailto:' + e(scholar.email) + '">' +
                              e(scholar.email) + '</a></p></div>'
                            : '') +
                        (scholar.phone ? '<div class="detail"><p class="detail__label">Phone</p>' +
                            '<p class="detail__value"><a href="tel:' + e(scholar.phone.replace(/ /g, '')) + '">' +
                            e(scholar.phone) + '</a></p></div>' : '') +
                      '</div>'
                    : '<div class="card"><div class="card__body"><p class="muted">' +
                      (isOwn
                        ? 'You have not added a phone number yet. <a href="#/edit">Add one</a> so other scholars can reach you.'
                        : 'This scholar has chosen not to share their contact details.') +
                      '</p></div></div>') +
            '</section>' +

            '<section class="section" style="margin-top:40px">' +
                '<div class="row row--between" style="margin-bottom:16px">' +
                    '<h2 class="heading">Academic results</h2>' +
                    (maySeeResults && documents.length > 1 ? '<span class="subtle">' + documents.length + ' versions on record</span>' : '') +
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
                return (s.first_name + ' ' + s.surname + ' ' + s.field_of_study + ' ' + s.email +
                        ' ' + (s.attachment_company || '') + ' ' +
                        (s.career || []).map(function (r) { return r.company + ' ' + r.job_title; }).join(' '))
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

        if (params.attachment_status) {
            scholars = scholars.filter(function (s) { return s.attachment_status === params.attachment_status; });
        }

        var sort = params.sort || 'surname';
        var direction = params.direction === 'desc' ? -1 : 1;

        // Mirrors the allow-list in ProfileRepository::SORTABLE — an
        // unrecognised key falls back to the default rather than being used.
        var sortable = {
            surname: 'surname',
            year_enrolled: 'year_enrolled',
            field: 'field_of_study',
            attachment: 'attachment_status'
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
            }).length,
            onAttachment: all.filter(function (s) { return s.attachment_status === 'in_progress'; }).length
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

        var viewerIsAdmin = isAdmin();
        var session = currentUser();

        var rows = visible.map(function (s) {
            var doc = currentDocument(s);
            var showContact = contactVisibleTo(s);

            return '<tr>' +
                '<td><div class="table__person">' +
                    '<span class="avatar avatar--sm" aria-hidden="true">' + e(initials(s)) + '</span>' +
                    '<span><span class="table__name">' + e(fullName(s)) + '</span>' +
                    (session && session.scholarId === s.id ? ' <span class="badge badge--blue">You</span>' : '') +
                    '</span>' +
                '</div></td>' +
                '<td>' + e(s.year_enrolled) + '</td>' +
                '<td>' + e(s.field_of_study) + '</td>' +
                '<td><span class="badge ' + (s.graduation_status === 'graduated' ? 'badge--success' : 'badge--blue') + '">' +
                    e(academicSummary(s)) + '</span></td>' +
                '<td><span class="badge badge--neutral">' + e(EMPLOYMENT_STATUSES[s.employment_status]) + '</span>' +
                    '<br><span class="table__email">' + e(employmentDisplay(s)) + '</span>' +
                '</td>' +
                '<td>' + (hasAttachment(s)
                    ? '<span class="badge ' + (s.attachment_status === 'in_progress' ? 'badge--warning' : 'badge--success') + '">' +
                      e(attachmentLabel(s)) + '</span>' +
                      (s.attachment_company ? '<br><span class="table__email">' + e(s.attachment_company) + '</span>' : '') +
                      (attachmentPeriod(s) ? '<br><span class="subtle">' + e(attachmentPeriod(s)) + '</span>' : '')
                    : '<span class="subtle">N/A</span>') + '</td>' +
                '<td>' + (showContact && (bestEmail(s) || s.phone)
                    ? '<span class="contact-cell">' +
                        (bestEmail(s) ? '<a class="contact-cell__link" href="mailto:' + e(bestEmail(s)) + '">' + e(bestEmail(s)) + '</a>' : '') +
                        (s.phone ? '<a class="contact-cell__link" href="tel:' + e(s.phone.replace(/ /g, '')) + '">' + e(s.phone) + '</a>' : '') +
                      '</span>'
                    : '<span class="subtle">Private</span>') + '</td>' +
                // The Results column exists only for administrators: whether a
                // scholar has uploaded a transcript is between them and the
                // programme.
                (viewerIsAdmin
                    ? '<td>' + (doc
                        ? '<span class="badge badge--blue">' + e(typeLabel(doc)) + '</span>'
                        : '<span class="badge badge--warning">Missing</span>') + '</td>'
                    : '') +
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
                '<th scope="col">' + sortLink('attachment', 'Attachment') + '</th>' +
                '<th scope="col">Contact</th>' +
                (viewerIsAdmin ? '<th scope="col">Results</th>' : '') +
                '<th scope="col"><span class="visually-hidden">Actions</span></th>' +
              '</tr></thead><tbody>' + rows + '</tbody></table></div>' + pager;

        var footnote = viewerIsAdmin ? '' :
            '<p class="subtle mt-24">Contact details appear only for scholars who have chosen ' +
            'to share them. Academic results are never shown here — they are visible only to ' +
            'their owner and to programme administrators. ' +
            '<a href="#/edit">Manage your own sharing</a>.</p>';

        return '<div class="shell">' +
            '<div class="section__head">' +
                '<p class="eyebrow">' + (viewerIsAdmin ? 'Administration' : 'Scholar network') + '</p>' +
                '<h1 class="display-2">Scholar directory</h1>' +
                '<p>' + (viewerIsAdmin
                    ? 'Search, review and update every scholar record in the programme.'
                    : 'Find scholars and alumni across the programme — see where they studied, ' +
                      'where they are working, and get in touch.') + '</p>' +
            '</div>' +
            '<div class="stat-grid mt-32">' +
                '<div class="stat"><p class="stat__label">Total scholars</p><p class="stat__value">' + stats.total + '</p></div>' +
                '<div class="stat"><p class="stat__label">Graduated</p><p class="stat__value">' + stats.graduated + '</p></div>' +
                '<div class="stat"><p class="stat__label">Current students</p><p class="stat__value">' + stats.current + '</p></div>' +
                '<div class="stat"><p class="stat__label">On attachment</p><p class="stat__value">' + stats.onAttachment + '</p></div>' +
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
                selectFilter('attachment_status', 'Attachment', 'All', ATTACHMENT_STATUSES, params.attachment_status || '') +
                '<div class="row">' +
                    '<button class="btn btn--primary" type="submit">Apply</button>' +
                    '<a class="btn btn--ghost" href="#/directory">Reset</a>' +
                '</div>' +
            '</div></div></form>' + table + footnote +
        '</div>';
    }

    /* ===============================================================
     | Announcements
     |================================================================ */

    /** Pinned first, then newest — mirrors AnnouncementRepository::feed(). */
    function announcementFeed(limit) {
        var list = load().announcements.slice();

        list.sort(function (a, b) {
            if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) {
                return a.is_pinned ? -1 : 1;
            }

            if (a.published_at !== b.published_at) {
                return a.published_at < b.published_at ? 1 : -1;
            }

            return b.id - a.id; // stable secondary key
        });

        return limit ? list.slice(0, limit) : list;
    }

    function isRecent(announcement) {
        var published = new Date(announcement.published_at).getTime();

        return !isNaN(published) && published > Date.now() - 7 * 86400000;
    }

    /**
     * The body is plain text, never HTML.
     *
     * Each paragraph is escaped separately and wrapped in <p>, so an
     * announcement that happens to mention <script> displays those
     * characters rather than running anything.
     */
    function announcementParagraphs(announcement) {
        return String(announcement.body)
            .replace(/\r\n/g, '\n')
            .split(/\n\s*\n/)
            .map(function (part) { return part.trim(); })
            .filter(Boolean)
            .map(function (part) { return '<p>' + e(part).replace(/\n/g, '<br>') + '</p>'; })
            .join('');
    }

    function excerpt(announcement, length) {
        var text = String(announcement.body).replace(/\s+/g, ' ').trim();

        if (text.length <= length) {
            return text;
        }

        var cut = text.slice(0, length);
        var space = cut.lastIndexOf(' ');

        if (space > length * 0.6) {
            cut = cut.slice(0, space);
        }

        return cut.replace(/\s+$/, '') + '…';
    }

    function viewAnnouncements() {
        var list = announcementFeed();
        var admin = isAdmin();

        if (list.length === 0) {
            return '<div class="shell"><div class="card"><div class="empty">' +
                '<h2>Nothing announced yet</h2>' +
                '<p>' + (admin
                    ? 'Post the first announcement — a meeting date, a deadline, or news the programme should know about.'
                    : 'When the programme posts news or a meeting notice, it will appear here.') + '</p>' +
                (admin ? '<a class="btn btn--primary" href="#/announcements/new">New announcement</a>' : '') +
            '</div></div></div>';
        }

        var items = list.map(function (a) {
            return '<article class="announcement' + (a.is_pinned ? ' announcement--pinned' : '') + '">' +
                '<div class="announcement__head">' +
                    '<div>' +
                        '<div class="announcement__badges">' +
                            (a.is_pinned ? '<span class="badge badge--blue">Pinned</span>' : '') +
                            (isRecent(a) ? '<span class="badge badge--success">New</span>' : '') +
                            '<span class="subtle">' + e(formatDate(a.published_at)) + '</span>' +
                        '</div>' +
                        '<h2 class="announcement__title">' + e(a.title) + '</h2>' +
                    '</div>' +
                    (admin
                        ? '<div class="row">' +
                            '<a class="btn btn--secondary btn--sm" href="#/announcements/' + a.id + '/edit">Edit</a>' +
                            '<button class="btn btn--ghost btn--sm" type="button" data-demo-delete-announcement="' + a.id + '">Delete</button>' +
                          '</div>'
                        : '') +
                '</div>' +
                '<div class="announcement__body">' + announcementParagraphs(a) + '</div>' +
                (a.author ? '<p class="announcement__meta">Posted by ' + e(a.author) + '</p>' : '') +
            '</article>';
        }).join('');

        return '<div class="shell">' +
            '<div class="row row--between">' +
                '<div class="section__head" style="margin-bottom:0">' +
                    '<p class="eyebrow">Programme</p>' +
                    '<h1 class="display-2">Announcements</h1>' +
                    '<p>Meetings, deadlines and news for everyone in the programme.</p>' +
                '</div>' +
                (admin ? '<a class="btn btn--primary" href="#/announcements/new">New announcement</a>' : '') +
            '</div>' +
            '<div class="announcement-list mt-32">' + items + '</div>' +
        '</div>';
    }

    function viewAnnouncementForm(announcement) {
        var isEditing = Boolean(announcement);

        return '<div class="shell">' +
            '<div class="section__head">' +
                '<p class="eyebrow">' + (isEditing ? 'Edit announcement' : 'New announcement') + '</p>' +
                '<h1 class="display-2">' + (isEditing ? 'Edit this announcement' : 'Post an announcement') + '</h1>' +
                '<p>Everyone signed in to the programme will see this.</p>' +
            '</div>' +

            '<div class="error-summary mt-24" data-demo-announcement-errors hidden role="alert">' +
                '<p class="error-summary__title">Please check the highlighted fields</p>' +
            '</div>' +

            '<form class="card mt-24" data-announcement-form novalidate>' +
                '<div class="card__body stack">' +
                    '<div class="field">' +
                        '<label class="field__label" for="title">Title ' +
                        '<span class="field__required" aria-hidden="true">*</span></label>' +
                        '<input class="input" type="text" id="title" name="title" maxlength="150" ' +
                            'placeholder="e.g. Scholars meeting — Saturday 14 March" value="' +
                            e(isEditing ? announcement.title : '') + '">' +
                        '<p class="field__error" id="title-error"></p>' +
                    '</div>' +
                    '<div class="field">' +
                        '<label class="field__label" for="body">Announcement ' +
                        '<span class="field__required" aria-hidden="true">*</span></label>' +
                        '<textarea class="textarea" id="body" name="body" rows="10" maxlength="5000" ' +
                            'placeholder="What is happening, when, and what anyone needs to do.">' +
                            e(isEditing ? announcement.body : '') + '</textarea>' +
                        '<p class="field__hint">Plain text. Leave a blank line between paragraphs.</p>' +
                        '<p class="field__error" id="body-error"></p>' +
                    '</div>' +
                    '<div class="field-grid">' +
                        '<div class="field">' +
                            '<label class="field__label" for="published_at">Publication date ' +
                            '<span class="field__optional">optional</span></label>' +
                            '<input class="input" type="date" id="published_at" name="published_at" value="' +
                                e(isEditing ? announcement.published_at : '') + '">' +
                            '<p class="field__hint">Leave blank to publish now.</p>' +
                            '<p class="field__error" id="published_at-error"></p>' +
                        '</div>' +
                        '<div class="field">' +
                            '<label class="checkbox" style="margin-top:26px">' +
                                '<input type="checkbox" id="is_pinned" name="is_pinned" value="1"' +
                                    (isEditing && announcement.is_pinned ? ' checked' : '') + '>' +
                                '<span class="checkbox__text">' +
                                    '<strong>Pin to the top</strong>' +
                                    '<span>Stays above everything else regardless of date.</span>' +
                                '</span>' +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card__footer">' +
                    '<button class="btn btn--primary" type="submit">' +
                        (isEditing ? 'Save changes' : 'Publish') + '</button>' +
                    '<a class="btn btn--ghost" href="#/announcements">Cancel</a>' +
                '</div>' +
            '</form>' +
        '</div>';
    }

    /**
     * Validate and save an announcement.
     *
     * Mirrors AnnouncementValidator: a title and a body are required, and
     * the body keeps its paragraph breaks rather than being whitespace
     * collapsed like the other free-text fields.
     */
    function saveAnnouncement(existing) {
        var form = document.querySelector('[data-announcement-form]');

        if (!form) {
            return;
        }

        var title = clean(form.querySelector('[name="title"]').value);
        var body = form.querySelector('[name="body"]').value.replace(/\r\n/g, '\n').trim();
        var published = form.querySelector('[name="published_at"]').value;
        var pinned = form.querySelector('[name="is_pinned"]').checked;
        var ok = true;

        function mark(name, message) {
            var input = form.querySelector('[name="' + name + '"]');
            var holder = document.getElementById(name + '-error');

            if (message) {
                input.classList.add('is-invalid');
                input.setAttribute('aria-invalid', 'true');
                ok = false;
            } else {
                input.classList.remove('is-invalid');
                input.removeAttribute('aria-invalid');
            }

            if (holder) {
                holder.textContent = message || '';
            }
        }

        mark('title', title === '' ? 'Give the announcement a title.'
            : (title.length > 150 ? 'The title must be 150 characters or fewer.' : ''));
        mark('body', body === '' ? 'Write the announcement.'
            : (body.length > 5000 ? 'The announcement must be 5,000 characters or fewer.' : ''));

        var summary = document.querySelector('[data-demo-announcement-errors]');

        if (!ok) {
            if (summary) {
                summary.hidden = false;
            }

            var firstInvalid = form.querySelector('.is-invalid');

            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus({ preventScroll: true });
            }

            return;
        }

        var store = load();
        var date = published || new Date().toISOString().slice(0, 10);

        if (existing) {
            existing.title = title;
            existing.body = body;
            existing.published_at = date;
            existing.is_pinned = pinned;
            flash('success', 'Announcement updated.');
        } else {
            store.announcements.push({
                id: store.nextAnnouncementId++,
                title: title,
                body: body,
                is_pinned: pinned,
                published_at: date,
                author: currentUser().email
            });
            flash('success', 'Announcement published.');
        }

        save();
        go('/announcements');
    }

    function forbidden(message) {
        return '<div class="shell"><div class="card"><div class="empty">' +
            '<p class="eyebrow">Error 403</p><h2 class="mt-8">Not allowed</h2>' +
            '<p>' + e(message) + '</p>' +
            '<a class="btn btn--primary" href="#/announcements">Back</a>' +
        '</div></div></div>';
    }

    function findAnnouncement(id) {
        var list = load().announcements;

        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === String(id)) {
                return list[i];
            }
        }

        return null;
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
        var sources = ['assets/js/validation.js', 'assets/js/upload.js', 'assets/js/career.js'];
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
        var undisclosedInput = form.querySelector('[name="employment_undisclosed"]');
        var undisclosed = Boolean(undisclosedInput && undisclosedInput.checked);

        /*
         * The career rows. A completely blank row is skipped - the form
         * always renders a spare - and the demo mirrors the server by
         * keeping only rows that have every required field.
         */
        var career = [];

        Array.prototype.forEach.call(form.querySelectorAll('[data-career-row]'), function (row) {
            var inputs = row.querySelectorAll('input');
            var company = clean(inputs[0].value);
            var title = clean(inputs[1].value);
            var start = clean(inputs[2].value);
            var end = clean(inputs[3].value);

            if (company === '' && title === '' && start === '' && end === '') {
                return;
            }

            if (company === '' || title === '' || !/^\d{4}$/.test(start)) {
                return;
            }

            career.push({
                company: company,
                job_title: title,
                start_year: parseInt(start, 10),
                end_year: /^\d{4}$/.test(end) ? parseInt(end, 10) : null
            });
        });

        var attachmentStatus = value('attachment_status') || 'not_applicable';
        var attachmentActive = CONFIG.attachmentStatuses.indexOf(attachmentStatus) !== -1;
        var contactInput = form.querySelector('[name="contact_visible"]');

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
            employment_undisclosed: undisclosed,
            career: career,

            attachment_status: attachmentStatus,

            // Same discard rule for the attachment: a status of N/A clears
            // the company and date rather than leaving them stored.
            attachment_company: attachmentActive ? (value('attachment_company') || null) : null,
            attachment_start: attachmentActive ? (value('attachment_start') || null) : null,
            attachment_end: attachmentActive ? (value('attachment_end') || null) : null,

            phone: value('phone') || null,
            personal_email: value('personal_email') || null,

            // An unticked checkbox submits nothing, so absence means OFF —
            // otherwise the consent could never be withdrawn.
            contact_visible: Boolean(contactInput && contactInput.checked)
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
                career: [],
                contact_visible: true,
                employment_undisclosed: false,
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
             path.indexOf('/scholar/') === 0 || path.indexOf('/announcements') === 0) && !session) {
            flash('info', 'Please choose a demo account to continue.');
            window.location.hash = '/login';

            return;
        }

        var scholarMatch = path.match(/^\/scholar\/(\d+)(\/edit)?$/);
        var announcementEditMatch = path.match(/^\/announcements\/(\d+)\/edit$/);

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
            // Open to every signed-in member, not just administrators.
            html = viewDirectory(params);
        } else if (path === '/announcements') {
            html = viewAnnouncements();
        } else if (path === '/announcements/new') {
            html = isAdmin() ? viewAnnouncementForm(null) : forbidden('Only administrators can post announcements.');
            if (isAdmin()) {
                afterRender = function () { saveAnnouncement(null); };
            }
        } else if (announcementEditMatch) {
            var target = findAnnouncement(announcementEditMatch[1]);

            if (!isAdmin()) {
                html = forbidden('Only administrators can edit announcements.');
            } else if (!target) {
                html = viewNotFound();
            } else {
                html = viewAnnouncementForm(target);
                afterRender = function () { saveAnnouncement(target); };
            }
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

        // The announcement form has its own submit handler; the profile
        // form is driven by the application's real validator below.
        var announcementForm = view.querySelector('[data-announcement-form]');

        if (announcementForm && afterRender) {
            announcementForm.addEventListener('submit', function (event) {
                event.preventDefault();
                afterRender();
            });
        }

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

        var del = event.target.closest('[data-demo-delete-announcement]');

        if (del) {
            if (!window.confirm('Delete this announcement? This cannot be undone.')) {
                return;
            }

            var id = del.getAttribute('data-demo-delete-announcement');
            var store = load();

            store.announcements = store.announcements.filter(function (a) {
                return String(a.id) !== String(id);
            });

            save();
            flash('success', 'Announcement deleted.');
            go('/announcements');

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

        ['search', 'cohort', 'graduation_status', 'employment_status', 'attachment_status'].forEach(function (name) {
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
