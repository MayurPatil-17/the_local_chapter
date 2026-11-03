
/* ==========================================================
   PAGE LOAD REVEAL
   Smooth fade-in when the page finishes loading.
   ========================================================== */

 document.addEventListener("DOMContentLoaded", () => {

    const revealElements = document.querySelectorAll(
        ".hero-content, " +
        ".experience-text, " +
        ".experience-image, " +
        ".local_chapter-text, " +
        ".local_chapter-image, " +
        ".local_chapter-categories, " +
        ".temple-head, " +
        ".dest-card, " +
        ".section-heading, " +
        ".food-hero, " +
        ".editorial-intro, " +
        ".chapter-row, " +
        ".guide-heading, " +
        ".visitor-guide, " +
        ".form-heading, " +
        ".booking-layout, " +
        ".footer-top, " +
        ".footer-bottom"
    );

    // Add reveal class to selected elements.
    revealElements.forEach(element => {
        element.classList.add("js-reveal");
    });

    // Check browser support.
    if (!("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
        return;
    }

    // Create observer.
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    // Observe all elements.
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

});

/* ==========================================================
   DESTINATION TIMELINE AND CAROUSEL
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const routeViewport = document.querySelector("#routeViewport");
    const route = document.querySelector("#route");
    const routeFill = document.querySelector("#routeFill");

    const routeStops = [
        ...document.querySelectorAll(".route-stop[data-go]")
    ];

    const destTrack = document.querySelector(".dest-track");

    const destCards = [
        ...document.querySelectorAll(".dest-card")
    ];

    const prevBtn = document.querySelector(".dest-nav.prev");
    const nextBtn = document.querySelector(".dest-nav.next");

    if (
        !routeViewport ||
        !route ||
        !destTrack ||
        !destCards.length
    ) return;

    let currentIndex = 0;
    let scrollTimer = null;
    let resizeTimer = null;


    // Calculate element position inside its scroll container.

    function getScrollPosition(element, container) {

        return (
            container.scrollLeft +
            element.getBoundingClientRect().left -
            container.getBoundingClientRect().left
        );

    }


    // Center active timeline stop.

    function centerRouteStop(stop) {

        if (!stop) return;

        const stopCenter =
            stop.offsetLeft + stop.offsetWidth / 2;

        const target =
            stopCenter - routeViewport.clientWidth / 2;

        routeViewport.scrollTo({
            left: Math.max(
                0,
                Math.min(
                    target,
                    routeViewport.scrollWidth -
                    routeViewport.clientWidth
                )
            ),
            behavior: "smooth"
        });

    }


    // Update active timeline indicator.

    function updateRoute(index, center = true) {

        currentIndex = Math.max(
            0,
            Math.min(index, destCards.length - 1)
        );

        const homeStop = route.querySelector(
            '[data-go="home"]'
        );

        const activeStop = route.querySelector(
            `[data-go="${currentIndex}"]`
        );

        routeStops.forEach(stop => {

            const isActive =
                stop.dataset.go === String(currentIndex);

            stop.classList.toggle("on", isActive);

            stop.setAttribute(
                "aria-current",
                isActive ? "step" : "false"
            );

        });


        // Animate route progress line.

        if (homeStop && activeStop && routeFill) {

            const homeCenter =
                homeStop.offsetLeft + homeStop.offsetWidth / 2;

            const activeCenter =
                activeStop.offsetLeft + activeStop.offsetWidth / 2;

            routeFill.style.left = `${homeCenter}px`;

            routeFill.style.width =
                `${Math.max(0, activeCenter - homeCenter)}px`;

        }


        // Keep active destination visible.

        if (center) {
            centerRouteStop(activeStop);
        }


        // Desktop navigation states.

        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled =
                currentIndex === destCards.length - 1;
        }

    }


    // Navigate to destination card.

    function goToDestination(index) {

        if (
            index < 0 ||
            index >= destCards.length
        ) return;

        const card = destCards[index];

        const target = getScrollPosition(
            card,
            destTrack
        );

        updateRoute(index);

        destTrack.scrollTo({
            left: target,
            behavior: "smooth"
        });

    }


    // Timeline click events.

    routeStops.forEach(stop => {

        stop.addEventListener("click", () => {

            const index = stop.dataset.go === "home"
                ? 0
                : Number(stop.dataset.go);

            goToDestination(index);

        });

    });


    // Previous button.

    prevBtn?.addEventListener("click", () => {
        goToDestination(currentIndex - 1);
    });


    // Next button.

    nextBtn?.addEventListener("click", () => {
        goToDestination(currentIndex + 1);
    });


    // Detect card closest to carousel center.

    function detectActiveCard() {

        const trackCenter =
            destTrack.getBoundingClientRect().left +
            destTrack.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        destCards.forEach((card, index) => {

            const cardRect = card.getBoundingClientRect();

            const cardCenter =
                cardRect.left + cardRect.width / 2;

            const distance = Math.abs(
                trackCenter - cardCenter
            );

            if (distance < closestDistance) {

                closestDistance = distance;
                closestIndex = index;

            }

        });

        if (closestIndex !== currentIndex) {
            updateRoute(closestIndex);
        }

    }


    // Synchronize timeline after scrolling.

    function handleCardScroll() {

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(() => {
            detectActiveCard();
        }, 140);

    }

    destTrack.addEventListener(
        "scroll",
        handleCardScroll,
        { passive: true }
    );


    // Initial setup.

    updateRoute(0);


    // Recalculate positions after resizing.

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            updateRoute(currentIndex);
        }, 150);

    });

});


/* ==========================================================
   FAQ AND TERMS ACCORDION
   ========================================================== */

document.querySelectorAll(".term-cond, .faq-category").forEach(group => {

    group.querySelectorAll("details").forEach(item => {

        item.addEventListener("toggle", () => {

            if (!item.open) return;

            group.querySelectorAll("details").forEach(other => {

                if (other !== item) {
                    other.open = false;
                }

            });

        });

    });

});


/* ==========================================================
   BOOKING FORM AND WHATSAPP ENQUIRY
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("booking-form");

    if (!form) return;

    const stayOptions = document.querySelectorAll(
        'input[name="stay"]'
    );

    const activityCheckboxes = document.querySelectorAll(
        'input[name="experience"]'
    );

    const allowanceText = document.getElementById(
        "activity-allowance"
    );

    const selectionCount = document.getElementById(
        "selection-count"
    );

    const selectionLimit = document.getElementById(
        "selection-limit"
    );


    // WhatsApp number: country code without + or spaces.

    const whatsappNumber = "919075602808";

    let activityLimit = 0;


    // 1. UPDATE ACTIVITY ALLOWANCE.

    function updateAllowance() {

        const selectedStay = document.querySelector(
            'input[name="stay"]:checked'
        );

        if (!selectedStay) {

            activityLimit = 0;

            if (allowanceText) {
                allowanceText.textContent =
                    "Select your stay duration to see your activity allowance.";
            }

            updateSelectionCount();

            return;
        }

        activityLimit = Number(
            selectedStay.dataset.activityLimit
        );

        const stayName = selectedStay.value;

        if (allowanceText) {

            allowanceText.textContent =
                `For ${stayName}, you can select up to ${activityLimit} activity from each category: Sacred Destinations, Indoor Activities and Outdoor Activities.`;

        }

        updateSelectionCount();

    }


    // 2. CONTROL ACTIVITY SELECTION.

    activityCheckboxes.forEach(function (checkbox) {

        checkbox.addEventListener("change", function () {

            const category = checkbox.dataset.category;

            const selectedInCategory = document.querySelectorAll(
                `input[data-category="${category}"]:checked`
            );


            // Prevent selection before choosing stay duration.

            if (activityLimit === 0) {

                checkbox.checked = false;

                alert("Please select your stay duration first.");

                return;
            }


            // Enforce category-specific activity limit.

            if (selectedInCategory.length > activityLimit) {

                checkbox.checked = false;

                alert(
                    `You can select only ${activityLimit} activities from this category.`
                );

            }

            updateSelectionCount();

        });

    });


    // 3. UPDATE SELECTION COUNTER.

    function updateSelectionCount() {

        if (!selectionCount || !selectionLimit) return;

        const selectedActivities = document.querySelectorAll(
            'input[name="experience"]:checked'
        );

        const totalSelected = selectedActivities.length;

        const totalAllowed = activityLimit * 3;

        selectionCount.textContent =
            `${totalSelected} of ${totalAllowed} activities selected`;

        if (activityLimit === 0) {

            selectionLimit.textContent =
                "Select your stay duration first.";

        } else {

            selectionLimit.textContent =
                `Up to ${activityLimit} per category`;

        }

    }


    // 4. HANDLE STAY DURATION CHANGES.

    stayOptions.forEach(function (option) {

        option.addEventListener("change", function () {

            activityLimit = Number(
                option.dataset.activityLimit
            );


            // Remove excess activities if stay duration is reduced.

            ["sacred", "indoor", "outdoor"].forEach(function (category) {

                const selected = Array.from(
                    document.querySelectorAll(
                        `input[data-category="${category}"]:checked`
                    )
                );

                while (selected.length > activityLimit) {
                    selected.pop().checked = false;
                }

            });

            updateAllowance();

        });

    });


    // 5. SEND ENQUIRY TO WHATSAPP.

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        // HTML required fields are validated before this event.

        const guestName = document.getElementById(
            "guest-name"
        ).value.trim();

        const guestPhone = document.getElementById(
            "guest-phone"
        ).value.trim();

        const guestEmail = document.getElementById(
            "guest-email"
        ).value.trim();

        const guestMessage = document.getElementById(
            "guest-message"
        ).value.trim();

        const selectedStay = document.querySelector(
            'input[name="stay"]:checked'
        );


        if (
            !guestName ||
            !guestPhone ||
            !guestEmail ||
            !selectedStay
        ) {

            alert(
                "Please complete your guest details and select your stay duration."
            );

            return;

        }


        // Collect selected activities category-wise.

        const sacred = [];
        const indoor = [];
        const outdoor = [];

        activityCheckboxes.forEach(function (checkbox) {

            if (checkbox.checked) {

                if (checkbox.dataset.category === "sacred") {
                    sacred.push(checkbox.value);
                }

                if (checkbox.dataset.category === "indoor") {
                    indoor.push(checkbox.value);
                }

                if (checkbox.dataset.category === "outdoor") {
                    outdoor.push(checkbox.value);
                }

            }

        });


        // Prepare WhatsApp message.

        const message = `
*THE LOCAL CHAPTER - STAY ENQUIRY*

*GUEST DETAILS*
Name: ${guestName}
Mobile: ${guestPhone}
Email: ${guestEmail}

*STAY DETAILS*
Duration: ${selectedStay.value}

*SELECTED EXPERIENCES*

Sacred Destinations:
${sacred.length ? sacred.join(", ") : "None selected"}

Indoor Activities:
${indoor.length ? indoor.join(", ") : "None selected"}

Outdoor Activities:
${outdoor.length ? outdoor.join(", ") : "None selected"}

Total Activities: ${sacred.length + indoor.length + outdoor.length}

*ADDITIONAL MESSAGE*
${guestMessage || "No additional message."}

Thank you!
        `;


        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");

    });


    // INITIAL COUNTER.

    updateAllowance();

});


/* ==========================================================
   NAVBAR SCROLL EFFECT
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    function handleScroll() {

        if (window.scrollY > 50) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }


    // Run on page load in case user refreshed midway down.

    handleScroll();


    // Attach scroll listener.

    window.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
    );

});


/* ==========================================================
   MOBILE NAVIGATION
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const navToggle = document.getElementById("navToggle");

    const mobileNav = document.getElementById("mobileNav");

    const mobileLinks = document.querySelectorAll(".mobile-link");


    if (navToggle && mobileNav) {

        navToggle.setAttribute("aria-expanded", "false");


        // Toggle menu open/close.

        navToggle.addEventListener("click", () => {

            const isOpen =
                navToggle.classList.toggle("active");

            mobileNav.classList.toggle("active", isOpen);

            navToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            document.body.style.overflow =
                isOpen ? "hidden" : "";

        });


        // Close menu when a link is clicked.

        mobileLinks.forEach(link => {

            link.addEventListener("click", () => {

                navToggle.classList.remove("active");

                mobileNav.classList.remove("active");

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                document.body.style.overflow = "";

            });

        });

    }

});


/* ==========================================================
   EXPERIENCE CARD SCROLL ANIMATION
   ========================================================== */

(() => {

    const stacks = document.querySelectorAll(
        ".experience-stack"
    );

    if (!stacks.length) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reduceMotion.matches) return;

    let frameRequested = false;


    function updateStack() {

        const viewportHeight = window.innerHeight;

        const isMobile = window.innerWidth <= 1300;


        stacks.forEach((stack) => {

            const cards = stack.querySelectorAll(
                ".experience-card"
            );

            cards.forEach((card, index) => {

                card.style.setProperty(
                    "--card-index",
                    index
                );

                let scale = 1;


                if (index < cards.length - 1) {

                    const nextCard = cards[index + 1];

                    const nextRect =
                        nextCard.getBoundingClientRect();

                    if (nextRect.top <= viewportHeight) {

                        const distance =
                            viewportHeight - nextRect.top;

                        const scrollSpan =
                            isMobile ? 200 : 300;

                        const progress = Math.min(
                            1,
                            Math.max(0, distance / scrollSpan)
                        );

                        scale = 1 - progress * 0.05;

                    }

                }

                card.style.transform = `scale(${scale})`;

            });

        });

        frameRequested = false;

    }


    function requestUpdate() {

        if (frameRequested) return;

        frameRequested = true;

        requestAnimationFrame(updateStack);

    }


    window.addEventListener(
        "scroll",
        requestUpdate,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        requestUpdate
    );


    // Initial call.

    updateStack();

})();
