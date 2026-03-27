(() => {
    const runtime = window.LUXEditRuntime;
    if (!runtime) return;

    const TOKEN_GROUPS = [
        {
            title: 'Typography',
            items: [
                { key: 'heroTitleDesktop', label: 'Hero title desktop', min: 32, max: 120, step: 1, unit: 'px' },
                { key: 'heroTitleTablet', label: 'Hero title tablet', min: 28, max: 96, step: 1, unit: 'px' },
                { key: 'heroTitleMobile', label: 'Hero title mobile', min: 24, max: 72, step: 1, unit: 'px' },
                { key: 'h1SizeDesktop', label: 'H1 desktop', min: 32, max: 120, step: 1, unit: 'px' },
                { key: 'h1SizeTablet', label: 'H1 tablet', min: 28, max: 96, step: 1, unit: 'px' },
                { key: 'h1SizeMobile', label: 'H1 mobile', min: 24, max: 72, step: 1, unit: 'px' },
                { key: 'h2SizeDesktop', label: 'H2 desktop', min: 24, max: 72, step: 1, unit: 'px' },
                { key: 'h2SizeTablet', label: 'H2 tablet', min: 22, max: 60, step: 1, unit: 'px' },
                { key: 'h2SizeMobile', label: 'H2 mobile', min: 20, max: 48, step: 1, unit: 'px' },
                { key: 'bodySizeDesktop', label: 'Body desktop', min: 14, max: 26, step: 1, unit: 'px' },
                { key: 'bodySizeTablet', label: 'Body tablet', min: 14, max: 24, step: 1, unit: 'px' },
                { key: 'bodySizeMobile', label: 'Body mobile', min: 14, max: 22, step: 1, unit: 'px' },
                { key: 'buttonTextSizeDesktop', label: 'Button desktop', min: 10, max: 22, step: 1, unit: 'px' },
                { key: 'buttonTextSizeTablet', label: 'Button tablet', min: 10, max: 22, step: 1, unit: 'px' },
                { key: 'buttonTextSizeMobile', label: 'Button mobile', min: 10, max: 22, step: 1, unit: 'px' },
                { key: 'headingLineHeight', label: 'Heading line height', min: 0.9, max: 1.6, step: 0.01, unit: '' },
                { key: 'bodyLineHeight', label: 'Body line height', min: 1.2, max: 2.2, step: 0.01, unit: '' },
                { key: 'headlineLetterSpacing', label: 'Headline letter spacing', min: -0.08, max: 0.2, step: 0.01, unit: 'em' }
            ]
        },
        {
            title: 'Spacing',
            items: [
                { key: 'sectionSpacingDesktop', label: 'Section spacing desktop', min: 48, max: 220, step: 1, unit: 'px' },
                { key: 'sectionSpacingTablet', label: 'Section spacing tablet', min: 40, max: 180, step: 1, unit: 'px' },
                { key: 'sectionSpacingMobile', label: 'Section spacing mobile', min: 32, max: 140, step: 1, unit: 'px' },
                { key: 'contentGapDesktop', label: 'Content gap desktop', min: 12, max: 120, step: 1, unit: 'px' },
                { key: 'contentGapTablet', label: 'Content gap tablet', min: 12, max: 96, step: 1, unit: 'px' },
                { key: 'contentGapMobile', label: 'Content gap mobile', min: 8, max: 72, step: 1, unit: 'px' }
            ]
        },
        {
            title: 'Layout',
            items: [
                { key: 'heroHeightDesktop', label: 'Hero height desktop', min: 60, max: 120, step: 1, unit: 'svh' },
                { key: 'heroHeightTablet', label: 'Hero height tablet', min: 50, max: 110, step: 1, unit: 'svh' },
                { key: 'heroHeightMobile', label: 'Hero height mobile', min: 45, max: 100, step: 1, unit: 'svh' },
                { key: 'containerMaxWidth', label: 'Container max width', min: 960, max: 1600, step: 1, unit: 'px' },
                { key: 'sectionContentMaxWidth', label: 'Section content width', min: 560, max: 1200, step: 1, unit: 'px' },
                { key: 'heroTextMaxWidth', label: 'Hero text width', min: 420, max: 1200, step: 1, unit: 'px' },
                { key: 'heroTextOffsetY', label: 'Hero text offset Y', min: -160, max: 160, step: 1, unit: 'px' }
            ]
        },
        {
            title: 'Buttons',
            items: [
                { key: 'buttonPaddingXDesktop', label: 'Button X desktop', min: 12, max: 80, step: 1, unit: 'px' },
                { key: 'buttonPaddingXTablet', label: 'Button X tablet', min: 12, max: 72, step: 1, unit: 'px' },
                { key: 'buttonPaddingXMobile', label: 'Button X mobile', min: 10, max: 64, step: 1, unit: 'px' },
                { key: 'buttonPaddingYDesktop', label: 'Button Y desktop', min: 8, max: 32, step: 1, unit: 'px' },
                { key: 'buttonPaddingYTablet', label: 'Button Y tablet', min: 8, max: 28, step: 1, unit: 'px' },
                { key: 'buttonPaddingYMobile', label: 'Button Y mobile', min: 8, max: 24, step: 1, unit: 'px' }
            ]
        }
    ];

    let workingConfig = runtime.normalizeDesignConfig(runtime.getStoredDesignConfig());
    let selectedSlot = null;
    let textElements = [];
    let imageElements = [];
    let panelElement = null;

    function collectTargets() {
        textElements = Array.from(document.querySelectorAll('[data-editable]'));
        imageElements = Array.from(document.querySelectorAll('[data-image-slot]'));
    }

    function humanize(value) {
        return value.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
    }

    function getTokenValue(definition) {
        const stored = workingConfig.tokens[definition.key];
        const computed = getComputedStyle(document.documentElement).getPropertyValue(runtime.TOKEN_KEY_MAP[definition.key]).trim();
        const activeValue = stored || computed;
        const numericValue = parseFloat(activeValue);
        return Number.isFinite(numericValue) ? numericValue : definition.min;
    }

    function ensureImageConfig(slotKey) {
        if (!workingConfig.images[slotKey]) {
            workingConfig.images[slotKey] = {};
        }
        return workingConfig.images[slotKey];
    }

    function persist(statusText) {
        workingConfig = runtime.saveDesignConfig(workingConfig);
        runtime.applyDesignConfig(workingConfig);
        updateStatus(statusText);
        syncControls();
    }

    function updateStatus(message) {
        const status = document.querySelector('[data-edit-mode-status]');
        if (!status) return;
        status.textContent = message || 'Local changes saved to this browser.';
    }

    function buildPanel() {
        if (!panelElement) {
            panelElement = document.createElement('aside');
            panelElement.className = 'edit-mode-panel';
            document.body.appendChild(panelElement);
        }

        panelElement.innerHTML = `
            <div class="edit-mode-panel__inner">
                <div class="edit-mode-panel__header">
                    <div>
                        <p class="edit-mode-panel__eyebrow">Edit Mode</p>
                        <h2>Controlled visual editor</h2>
                    </div>
                    <button type="button" class="edit-mode-button edit-mode-button--ghost" data-edit-mode-close>Close</button>
                </div>
                <div class="edit-mode-panel__actions">
                    <button type="button" class="edit-mode-button" data-edit-mode-save>Save</button>
                    <button type="button" class="edit-mode-button edit-mode-button--ghost" data-edit-mode-export>Export JSON</button>
                    <button type="button" class="edit-mode-button edit-mode-button--ghost" data-edit-mode-import-trigger>Import JSON</button>
                    <button type="button" class="edit-mode-button edit-mode-button--ghost" data-edit-mode-reset>Reset local</button>
                    <input type="file" accept="application/json" hidden data-edit-mode-import>
                </div>
                <p class="edit-mode-panel__status" data-edit-mode-status>Local changes saved to this browser.</p>
                <details open class="edit-mode-group">
                    <summary>Text fields (${textElements.length})</summary>
                    <div class="edit-mode-slot-list" data-edit-mode-text-list></div>
                </details>
                <details open class="edit-mode-group">
                    <summary>Image slots (${imageElements.length})</summary>
                    <div data-edit-mode-image-list></div>
                </details>
                ${TOKEN_GROUPS.map((group) => `
                    <details open class="edit-mode-group">
                        <summary>${group.title}</summary>
                        <div class="edit-mode-control-list">
                            ${group.items.map((item) => `
                                <label class="edit-mode-control">
                                    <span>${item.label}</span>
                                    <div class="edit-mode-control__inputs">
                                        <input
                                            type="range"
                                            min="${item.min}"
                                            max="${item.max}"
                                            step="${item.step}"
                                            value="${getTokenValue(item)}"
                                            data-token-key="${item.key}"
                                            data-token-unit="${item.unit}">
                                        <output data-token-output="${item.key}"></output>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
        renderTextList(panelElement);
        renderImageList(panelElement);
        bindPanelEvents(panelElement);
        syncControls();
    }

    function renderTextList(panel) {
        const list = panel.querySelector('[data-edit-mode-text-list]');
        list.innerHTML = textElements.map((element) => {
            const key = element.getAttribute('data-editable');
            return `<button type="button" class="edit-mode-slot-button" data-focus-editable="${key}">${humanize(key)}</button>`;
        }).join('');
    }

    function renderImageList(panel) {
        const list = panel.querySelector('[data-edit-mode-image-list]');
        list.innerHTML = imageElements.map((element) => {
            const slotKey = element.getAttribute('data-image-slot');
            const slotConfig = ensureImageConfig(slotKey);
            const positionX = parseFloat(slotConfig.positionX || '50%') || 50;
            const positionY = parseFloat(slotConfig.positionY || '50%') || 50;
            return `
                <div class="edit-mode-image-card" data-image-card="${slotKey}">
                    <button type="button" class="edit-mode-slot-button" data-focus-image="${slotKey}">${humanize(slotKey)}</button>
                    <label class="edit-mode-control">
                        <span>Image source</span>
                        <input type="text" value="${slotConfig.src || element.getAttribute('src') || ''}" data-image-src="${slotKey}" placeholder="/images/example.jpg">
                    </label>
                    <label class="edit-mode-control">
                        <span>Focus X</span>
                        <div class="edit-mode-control__inputs">
                            <input type="range" min="0" max="100" step="1" value="${positionX}" data-image-pos-x="${slotKey}">
                            <output data-image-pos-x-output="${slotKey}">${positionX}%</output>
                        </div>
                    </label>
                    <label class="edit-mode-control">
                        <span>Focus Y</span>
                        <div class="edit-mode-control__inputs">
                            <input type="range" min="0" max="100" step="1" value="${positionY}" data-image-pos-y="${slotKey}">
                            <output data-image-pos-y-output="${slotKey}">${positionY}%</output>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    function syncControls() {
        TOKEN_GROUPS.forEach((group) => {
            group.items.forEach((item) => {
                const input = document.querySelector(`[data-token-key="${item.key}"]`);
                const output = document.querySelector(`[data-token-output="${item.key}"]`);
                if (!input || !output) return;
                const value = getTokenValue(item);
                input.value = String(value);
                output.value = `${value}${item.unit}`;
                output.textContent = `${value}${item.unit}`;
            });
        });

        imageElements.forEach((element) => {
            const slotKey = element.getAttribute('data-image-slot');
            const slotConfig = ensureImageConfig(slotKey);
            const srcInput = document.querySelector(`[data-image-src="${slotKey}"]`);
            const xInput = document.querySelector(`[data-image-pos-x="${slotKey}"]`);
            const yInput = document.querySelector(`[data-image-pos-y="${slotKey}"]`);
            const xOutput = document.querySelector(`[data-image-pos-x-output="${slotKey}"]`);
            const yOutput = document.querySelector(`[data-image-pos-y-output="${slotKey}"]`);
            if (srcInput) srcInput.value = slotConfig.src || element.getAttribute('src') || '';
            if (xInput) xInput.value = String(parseFloat(slotConfig.positionX || '50%') || 50);
            if (yInput) yInput.value = String(parseFloat(slotConfig.positionY || '50%') || 50);
            if (xOutput) xOutput.textContent = `${xInput ? xInput.value : '50'}%`;
            if (yOutput) yOutput.textContent = `${yInput ? yInput.value : '50'}%`;
        });
    }

    function focusEditable(key) {
        const element = document.querySelector(`[data-editable="${key}"]`);
        if (!element) return;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => element.focus(), 150);
    }

    function focusImage(slotKey) {
        const element = document.querySelector(`[data-image-slot="${slotKey}"]`);
        if (!element) return;
        selectedSlot = slotKey;
        highlightSelectedImage();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function highlightSelectedImage() {
        document.querySelectorAll('[data-image-slot]').forEach((image) => {
            const isSelected = image.getAttribute('data-image-slot') === selectedSlot;
            image.toggleAttribute('data-edit-selected', isSelected);
        });
        document.querySelectorAll('[data-image-card]').forEach((card) => {
            const isSelected = card.getAttribute('data-image-card') === selectedSlot;
            card.toggleAttribute('data-selected', isSelected);
        });
    }

    function bindPanelEvents(panel) {
        panel.querySelector('[data-edit-mode-save]').addEventListener('click', () => {
            persist('Saved to localStorage.');
        });

        panel.querySelector('[data-edit-mode-close]').addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.searchParams.delete('edit');
            url.searchParams.delete('key');
            window.location.href = url.toString();
        });

        panel.querySelector('[data-edit-mode-export]').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(workingConfig, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'design-config.json';
            link.click();
            URL.revokeObjectURL(link.href);
            updateStatus('Exported design-config.json.');
        });

        const importInput = panel.querySelector('[data-edit-mode-import]');
        panel.querySelector('[data-edit-mode-import-trigger]').addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', async (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                workingConfig = runtime.normalizeDesignConfig(JSON.parse(text));
                runtime.saveDesignConfig(workingConfig);
                runtime.applyDesignConfig(workingConfig);
                syncControls();
                updateStatus('Imported config and applied it live.');
            } catch (error) {
                console.error('Unable to import config:', error);
                updateStatus('Import failed. Check the JSON format.');
            }
            importInput.value = '';
        });

        panel.querySelector('[data-edit-mode-reset]').addEventListener('click', () => {
            localStorage.removeItem(runtime.DESIGN_CONFIG_STORAGE_KEY);
            workingConfig = runtime.normalizeDesignConfig({});
            runtime.applyDesignConfig(workingConfig);
            window.location.reload();
        });

        panel.addEventListener('click', (event) => {
            const textButton = event.target.closest('[data-focus-editable]');
            if (textButton) {
                focusEditable(textButton.getAttribute('data-focus-editable'));
                return;
            }

            const imageButton = event.target.closest('[data-focus-image]');
            if (imageButton) {
                focusImage(imageButton.getAttribute('data-focus-image'));
            }
        });

        panel.querySelectorAll('[data-token-key]').forEach((input) => {
            input.addEventListener('input', () => {
                const key = input.getAttribute('data-token-key');
                const unit = input.getAttribute('data-token-unit') || '';
                workingConfig.tokens[key] = `${input.value}${unit}`;
                persist(`Updated ${key}.`);
            });
        });

        panel.querySelectorAll('[data-image-src]').forEach((input) => {
            input.addEventListener('change', () => {
                const slotKey = input.getAttribute('data-image-src');
                ensureImageConfig(slotKey).src = input.value.trim();
                persist(`Updated ${slotKey} source.`);
            });
        });

        panel.querySelectorAll('[data-image-pos-x]').forEach((input) => {
            input.addEventListener('input', () => {
                const slotKey = input.getAttribute('data-image-pos-x');
                ensureImageConfig(slotKey).positionX = `${input.value}%`;
                persist(`Updated ${slotKey} focus X.`);
            });
        });

        panel.querySelectorAll('[data-image-pos-y]').forEach((input) => {
            input.addEventListener('input', () => {
                const slotKey = input.getAttribute('data-image-pos-y');
                ensureImageConfig(slotKey).positionY = `${input.value}%`;
                persist(`Updated ${slotKey} focus Y.`);
            });
        });
    }

    function enableInlineTextEditing() {
        textElements.forEach((element) => {
            if (element.dataset.editBindingReady === 'true') return;
            element.dataset.editBindingReady = 'true';
            element.setAttribute('contenteditable', 'plaintext-only');
            element.setAttribute('spellcheck', 'false');

            const editableKey = element.getAttribute('data-editable');

            element.addEventListener('click', (event) => {
                if (element.tagName === 'A') event.preventDefault();
            });

            element.addEventListener('focus', () => {
                element.setAttribute('data-edit-active', 'true');
            });

            element.addEventListener('blur', () => {
                element.removeAttribute('data-edit-active');
                workingConfig.text[editableKey] = element.textContent;
                persist(`Saved ${editableKey}.`);
            });
        });
    }

    function enableImageSelection() {
        imageElements.forEach((image) => {
            if (image.dataset.editBindingReady === 'true') return;
            image.dataset.editBindingReady = 'true';
            image.addEventListener('click', (event) => {
                event.preventDefault();
                selectedSlot = image.getAttribute('data-image-slot');
                highlightSelectedImage();
            });
        });
    }

    function refreshEditor() {
        collectTargets();
        buildPanel();
        enableInlineTextEditing();
        enableImageSelection();
        highlightSelectedImage();
    }

    document.body.dataset.editMode = 'true';
    collectTargets();
    runtime.applyDesignConfig(workingConfig);
    refreshEditor();
    updateStatus('Edit Mode active. Inline text edits save locally.');
    document.addEventListener('lux:editable-map-updated', refreshEditor);
})();
