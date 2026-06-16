/* ==========================================================================
   STATE MANAGEMENT & NAVIGATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const views = document.querySelectorAll('.spa-view');
    const navLinks = document.querySelectorAll('[data-target]');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Theme & Dir Toggles
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const dirToggles = document.querySelectorAll('.dir-toggle');

    /* --- 1. SPA ROUTING SYSTEM --- */
    let contactMap = null;

    function initContactMap() {
        const mapContainer = document.getElementById('contact-map');
        if (mapContainer && typeof L !== 'undefined' && !contactMap) {
            const lat = 37.4275;
            const lng = -122.1697;
            contactMap = L.map('contact-map', {
                scrollWheelZoom: false
            }).setView([lat, lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(contactMap);

            L.marker([lat, lng]).addTo(contactMap)
                .bindPopup('<strong>STEMCamp Campus</strong><br>512 Innovation Dr.<br>Stanford, CA 94305')
                .openPopup();
        }
    }

    function navigateTo(targetId) {
        // Toggle view visibility
        views.forEach(view => {
            if (view.id === `view-${targetId}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Hide mobile navigation menu if open
        if (navMenu) navMenu.classList.remove('active');

        // Manage header and footer visibility for Dashboard views
        const isDashboard = targetId.includes('dashboard');
        if (isDashboard) {
            body.classList.add('dashboard-active');
            // Auto initialize dashboard specific elements
            if (targetId === 'user-dashboard') {
                initSignaturePad();
            }
        } else {
            body.classList.remove('dashboard-active');
        }

        // Initialize and handle contact map sizing
        if (targetId === 'contact') {
            initContactMap();
            setTimeout(() => {
                if (contactMap) {
                    contactMap.invalidateSize();
                }
            }, 350);
        }

        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active class on links
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Attach navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target) navigateTo(target);
        });
    });

    // Mobile navigation dropdown toggle click handler
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                
                // Close other dropdowns
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('dropdown-active');
                    }
                });
                
                parent.classList.toggle('dropdown-active');
            }
        });
    });

    // Mobile nav hamburger toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Dashboard sidebar toggle click handler
    const dbToggleBtns = document.querySelectorAll('.dashboard-sidebar-toggle');
    dbToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dashboardView = btn.closest('.dashboard-view');
            if (dashboardView) {
                const sidebar = dashboardView.querySelector('.dashboard-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            }
        });
    });

    // Close dashboard sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const activeSidebars = document.querySelectorAll('.dashboard-sidebar.active');
            activeSidebars.forEach(sidebar => {
                if (!sidebar.contains(e.target) && !e.target.closest('.dashboard-sidebar-toggle')) {
                    sidebar.classList.remove('active');
                }
            });
        }
    });

    /* --- 2. THEME & DIRECTION TOGGLES --- */
    // Theme switching (Light / Dark)
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            
            // Sync all theme toggle icons
            themeToggles.forEach(t => {
                const icon = t.querySelector('i');
                if (icon) {
                    icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                }
            });
            // Save local setting
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    });

    // Direction switching (LTR / RTL)
    dirToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            body.classList.toggle('rtl');
            const isRtl = body.classList.contains('rtl');
            document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

            // Sync all direction toggle texts
            dirToggles.forEach(t => {
                const span = t.querySelector('span');
                if (span) {
                    span.textContent = isRtl ? 'LTR' : 'RTL';
                }
            });
            localStorage.setItem('dir', isRtl ? 'rtl' : 'ltr');
        });
    });

    // Initialize saved settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggles.forEach(t => {
            const icon = t.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-sun';
        });
    }

    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl') {
        body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
        dirToggles.forEach(t => {
            const span = t.querySelector('span');
            if (span) span.textContent = 'LTR';
        });
    }

    // Auto navigate based on query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
        navigateTo(viewParam);
    }


    /* ==========================================================================
       LANDING PAGE INTERACTIVE WIDGETS
       ========================================================================== */

    /* --- 3. ACCORDION (FAQ) --- */
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.parentElement;
            const isActive = parent.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle clicked item
            if (!isActive) {
                parent.classList.add('active');
            }
        });
    });

    /* --- 4. FINDER FILTER SYSTEM (HOME 2) --- */
    const btnFindCamps = document.getElementById('btn-find-camps');
    if (btnFindCamps) {
        btnFindCamps.addEventListener('click', () => {
            // Simply navigate to services tab with filters applied
            navigateTo('services');
            
            const ageVal = document.getElementById('finder-age').value;
            const categoryVal = document.getElementById('finder-category').value;
            
            // Simulate selecting filters in Services page
            const filterButtons = document.querySelectorAll('.btn-filter');
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-filter') === categoryVal) {
                    btn.click();
                }
            });
        });
    }

    /* --- 5. AGE EXPLORER TABS (HOME 2) --- */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    /* --- 6. CATALOG FILTER (SERVICES) --- */
    const filterBtns = document.querySelectorAll('.btn-filter');
    const catalogCards = document.querySelectorAll('.camp-catalog-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');
            catalogCards.forEach(card => {
                if (filterVal === 'all' || card.getAttribute('data-category') === filterVal) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* --- 7. ESTIMATOR CALCULATOR (HOME 2) --- */
    const calcCamps = document.getElementById('calc-camps');
    const calcSiblings = document.getElementById('calc-siblings');
    const calcTotal = document.getElementById('calc-total');
    const calcSavings = document.getElementById('calc-savings');

    function calculateCost() {
        if (!calcCamps || !calcSiblings || !calcTotal || !calcSavings) return;
        
        const camps = parseInt(calcCamps.value) || 0;
        const siblings = parseInt(calcSiblings.value) || 0;
        
        // Base rate: $450 per camp session
        const baseCost = camps * 450;
        
        // Discounts: Early bird (15%) + Sibling (10% per sibling, max 30%)
        const earlyBirdDiscount = baseCost * 0.15;
        const siblingDiscountRate = Math.min(siblings * 0.10, 0.30);
        const siblingDiscount = baseCost * siblingDiscountRate;
        
        const totalSavings = earlyBirdDiscount + siblingDiscount;
        const finalCost = Math.max(baseCost - totalSavings, 0);

        calcTotal.textContent = `$${Math.round(finalCost)}`;
        calcSavings.textContent = `You saved $${Math.round(totalSavings)} (Early Bird + Sibling discounts)`;
    }

    if (calcCamps) calcCamps.addEventListener('input', calculateCost);
    if (calcSiblings) calcSiblings.addEventListener('input', calculateCost);

    /* --- 8. HELP MESSENGER CHATBOT SIMULATION --- */
    const chatInput = document.getElementById('chat-input');
    const btnSendChat = document.getElementById('btn-send-chat');
    const chatMessages = document.getElementById('chat-messages-container');

    function handleChatResponse(userText) {
        if (!chatMessages) return;

        // User message
        const userMsgNode = document.createElement('div');
        userMsgNode.className = 'message msg-user';
        userMsgNode.innerHTML = `<p>${userText}</p><span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
        chatMessages.appendChild(userMsgNode);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Typing indicator
        const typingNode = document.createElement('div');
        typingNode.className = 'message msg-bot text-muted';
        typingNode.innerHTML = '<p><em>Typing...</em></p>';
        chatMessages.appendChild(typingNode);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Logic response
        setTimeout(() => {
            typingNode.remove();
            let botText = "I can assist you with information about 'waivers', 'camps', 'safety', or 'pricing'! What would you like to explore?";
            const checkText = userText.toLowerCase();

            if (checkText.includes('waiver') || checkText.includes('medical') || checkText.includes('sign')) {
                botText = "You can sign medical waivers directly inside the secure Parent Dashboard! Log in, select 'Medical Waivers', and draw your electronic signature.";
            } else if (checkText.includes('camp') || checkText.includes('coding') || checkText.includes('python')) {
                botText = "We offer 1-week summer camp paths: Scratch Coding (Ages 7-10), Python Game Design (Ages 10-14), and Arduino Circuits (Ages 12-15). All feature a strict 1:6 ratio!";
            } else if (checkText.includes('safety') || checkText.includes('nurse') || checkText.includes('allergy')) {
                botText = "Safety is our absolute priority. Our smart facility is nut-free, fingerprint secured, and has an on-site pediatric nurse managing all waivers.";
            } else if (checkText.includes('pricing') || checkText.includes('cost') || checkText.includes('discount')) {
                botText = "Our base camp rate is $390-$480 per week. Register early to save 15%! Sibling discounts are also available.";
            }

            const botMsgNode = document.createElement('div');
            botMsgNode.className = 'message msg-bot';
            botMsgNode.innerHTML = `<p>${botText}</p><span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
            chatMessages.appendChild(botMsgNode);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
    }

    if (btnSendChat && chatInput) {
        btnSendChat.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (text) {
                handleChatResponse(text);
                chatInput.value = '';
            }
        });
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnSendChat.click();
            }
        });
    }

    // Forms success mocks
    const inquiryForm = document.getElementById('contact-inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('form-success').classList.remove('hidden');
            inquiryForm.reset();
            setTimeout(() => {
                document.getElementById('form-success').classList.add('hidden');
            }, 4000);
        });
    }

    const tourBtn = document.getElementById('btn-book-tour');
    if (tourBtn) {
        tourBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('tour-success').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('tour-success').classList.add('hidden');
            }, 4000);
        });
    }


    /* ==========================================================================
       DASHBOARD INTERACTIONS & LOGIC
       ========================================================================== */

    /* --- 9. DASHBOARD SUB-PANEL NAVIGATION --- */
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const dashboardPanels = document.querySelectorAll('.dashboard-panel');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const panelId = link.getAttribute('data-panel');
            if (!panelId) return; // Ignore logout buttons

            // Select sidebar parent links context
            const parentSidebar = link.closest('.dashboard-sidebar');
            parentSidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch sub panels
            const contentArea = parentSidebar.nextElementSibling;
            contentArea.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
            const targetPanel = contentArea.querySelector(`#panel-${panelId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Update panel header title dynamically
            const panelTitle = link.textContent.trim();
            const headerTitleNode = contentArea.querySelector('header h2');
            if (headerTitleNode) {
                headerTitleNode.textContent = panelTitle;
            }
        });
    });

    // Logout function
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('home-1'); // Route back to main landing page
        });
    });

    /* --- 10. MOCK WAIVER SIGNATURE CANVAS (USER DASHBOARD) --- */
    let canvas, ctx, isDrawing = false;

    function initSignaturePad() {
        canvas = document.getElementById('signature-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;

        // Clear button
        const clearBtn = document.getElementById('btn-clear-sig');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }

        // Draw operations
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e.touches[0]);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e.touches[0]);
        });
        canvas.addEventListener('touchend', stopDrawing);
    }

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Submit Waiver Form
    const waiverForm = document.getElementById('waiver-form');
    if (waiverForm) {
        waiverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('waiver-success').classList.remove('hidden');
            
            // Update counts and status
            const countBadgeUser = document.getElementById('badge-waiver-count');
            if (countBadgeUser) countBadgeUser.style.display = 'none';

            const overviewStatus = document.getElementById('overview-waiver-status');
            if (overviewStatus) {
                overviewStatus.textContent = 'All Waivers Completed';
                overviewStatus.className = 'text-green';
            }

            // Sync with Admin Dashboard waiver count badge
            const countBadgeAdmin = document.getElementById('badge-admin-waivers');
            if (countBadgeAdmin) countBadgeAdmin.textContent = '1';

            setTimeout(() => {
                document.getElementById('waiver-success').classList.add('hidden');
            }, 4000);
        });
    }

    // Child Registration Form Submit
    const childRegForm = document.getElementById('child-reg-form');
    if (childRegForm) {
        childRegForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('child-reg-success').classList.remove('hidden');
            childRegForm.reset();
            setTimeout(() => {
                document.getElementById('child-reg-success').classList.add('hidden');
            }, 4000);
        });
    }

    /* --- 11. SECURE PHOTO GALLERY ACCESS SYSTEM (USER DASHBOARD) --- */
    const btnVerifyGallery = document.getElementById('btn-verify-gallery');
    const galleryPw = document.getElementById('gallery-pw');
    const galleryAuthBox = document.getElementById('gallery-auth-box');
    const galleryUnlocked = document.getElementById('gallery-unlocked');
    const galleryError = document.getElementById('gallery-error');

    if (btnVerifyGallery && galleryPw) {
        btnVerifyGallery.addEventListener('click', () => {
            if (galleryPw.value === 'camp2026') {
                galleryAuthBox.classList.add('hidden');
                galleryUnlocked.classList.remove('hidden');
                galleryError.classList.add('hidden');
            } else {
                galleryError.classList.remove('hidden');
                setTimeout(() => {
                    galleryError.classList.add('hidden');
                }, 3000);
            }
        });
    }

    /* --- 12. PARENT MESSENGER TO COUNSELOR --- */
    const parentChatInput = document.getElementById('parent-chat-input');
    const btnParentSend = document.getElementById('btn-parent-send');
    const parentChatMessages = document.getElementById('parent-chat-messages');

    if (btnParentSend && parentChatInput) {
        btnParentSend.addEventListener('click', () => {
            const text = parentChatInput.value.trim();
            if (text && parentChatMessages) {
                // User text bubble
                const bubble = document.createElement('div');
                bubble.className = 'message msg-user';
                bubble.innerHTML = `<p>${text}</p><span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                parentChatMessages.appendChild(bubble);
                parentChatMessages.scrollTop = parentChatMessages.scrollHeight;
                parentChatInput.value = '';

                // Simulate counselor automatic response
                setTimeout(() => {
                    const responseBubble = document.createElement('div');
                    responseBubble.className = 'message msg-other';
                    responseBubble.innerHTML = `<strong>Dr. Evelyn Thorne:</strong><p>Thank you for your response! I will keep you updated during tomorrow's Scratch game debugging session.</p><span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                    parentChatMessages.appendChild(responseBubble);
                    parentChatMessages.scrollTop = parentChatMessages.scrollHeight;
                }, 1000);
            }
        });
        parentChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnParentSend.click();
            }
        });
    }


    /* ==========================================================================
       ADMIN PORTAL CRUD OPERATIONS
       ========================================================================== */

    /* --- 13. MOCK WAIVER APPROVALS --- */
    const approveWaiverBtns = document.querySelectorAll('.btn-approve-waiver');
    approveWaiverBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rowId = btn.getAttribute('data-id');
            const targetRow = document.getElementById(`admin-waiver-row-${rowId}`);
            if (targetRow) {
                targetRow.remove();
            }
            
            // Update admin count badges
            const adminBadge = document.getElementById('badge-admin-waivers');
            if (adminBadge) {
                adminBadge.style.display = 'none';
            }

            // Show empty placeholder message
            const emptyAlert = document.getElementById('admin-waiver-empty');
            if (emptyAlert) {
                emptyAlert.classList.remove('hidden');
            }
        });
    });

    /* --- 14. ADMIN CAMPS CRUD OPERATIONS --- */
    const btnAddModal = document.getElementById('btn-add-camp-modal');
    const crudModal = document.getElementById('camp-crud-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnSaveCamp = document.getElementById('btn-save-camp');
    const adminCampsTable = document.getElementById('admin-camps-table').getElementsByTagName('tbody')[0];
    
    let activeEditRow = null;

    if (btnAddModal && crudModal) {
        btnAddModal.addEventListener('click', () => {
            activeEditRow = null;
            document.getElementById('modal-title-action').textContent = 'Add New Camp';
            document.getElementById('m-camp-title').value = '';
            document.getElementById('m-camp-age').value = '';
            document.getElementById('m-camp-price').value = '';
            crudModal.classList.remove('hidden');
        });
    }

    if (btnCancelModal && crudModal) {
        btnCancelModal.addEventListener('click', () => {
            crudModal.classList.add('hidden');
        });
    }

    // Save button logic (Handling both ADD and EDIT)
    if (btnSaveCamp && adminCampsTable) {
        btnSaveCamp.addEventListener('click', () => {
            const title = document.getElementById('m-camp-title').value.trim();
            const age = document.getElementById('m-camp-age').value.trim();
            const price = document.getElementById('m-camp-price').value.trim();

            if (!title || !age || !price) {
                alert('Please fill out all fields.');
                return;
            }

            if (activeEditRow) {
                // EDIT operation
                activeEditRow.cells[0].textContent = title;
                activeEditRow.cells[1].textContent = age;
                activeEditRow.cells[4].textContent = price;
            } else {
                // ADD operation
                const newRow = adminCampsTable.insertRow();
                newRow.innerHTML = `
                    <td>${title}</td>
                    <td>${age}</td>
                    <td>Week 1 & 2</td>
                    <td>0 / 15</td>
                    <td>${price}</td>
                    <td>
                        <button class="btn-action edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action delete"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                // Add event listeners to new row actions
                attachRowActionListeners(newRow);
            }

            crudModal.classList.add('hidden');
        });
    }

    // Attach row action listeners (Edit & Delete)
    function attachRowActionListeners(row) {
        const editBtn = row.querySelector('.edit');
        const deleteBtn = row.querySelector('.delete');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                activeEditRow = row;
                document.getElementById('modal-title-action').textContent = 'Edit Camp';
                document.getElementById('m-camp-title').value = row.cells[0].textContent;
                document.getElementById('m-camp-age').value = row.cells[1].textContent;
                document.getElementById('m-camp-price').value = row.cells[4].textContent;
                crudModal.classList.remove('hidden');
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this camp?')) {
                    row.remove();
                }
            });
        }
    }

    // Initialize row action listeners on default static rows
    if (adminCampsTable) {
        Array.from(adminCampsTable.rows).forEach(row => {
            attachRowActionListeners(row);
        });
    }

    // Admin photo upload mock
    const btnAdminUpload = document.getElementById('btn-admin-upload');
    if (btnAdminUpload) {
        btnAdminUpload.addEventListener('click', () => {
            document.getElementById('admin-upload-success').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('admin-upload-success').classList.add('hidden');
            }, 4000);
        });
    }
});
