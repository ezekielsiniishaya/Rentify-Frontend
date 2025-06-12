document.addEventListener("DOMContentLoaded", () => {
  // Get the feedback button or link by its ID
  const contactUs = document.getElementById("feedback");

  /* Displays a message (error or success) in the feedback form.
   */
  function showMessage(message, isSuccess = false) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    if (!errorContainer || !errorMessage) return;

    // Reset styles for the message container
    errorContainer.style.cssText = `
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                display: block;
            `;

    // Set styling based on message type
    if (isSuccess) {
      errorContainer.style.backgroundColor = "#dcfce7";
      errorContainer.style.border = "1px solid #bbf7d0";
      errorContainer.style.color = "#166534";
    } else {
      errorContainer.style.backgroundColor = "#fee2e2";
      errorContainer.style.border = "1px solid #fecaca";
      errorContainer.style.color = "#b91c1c";
    }

    errorMessage.textContent = message;

    // Hide the message after a timeout
    setTimeout(
      () => {
        errorContainer.style.display = "none";
      },
      isSuccess ? 3000 : 5000
    );
  }

  /**
   * Creates and displays the feedback form as a modal overlay.
   */
  function showFeedbackForm() {
    // Create overlay for modal background
    const overlay = document.createElement("div");
    overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                padding: 16px;
            `;

    // Create the feedback form element
    const form = document.createElement("form");
    form.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                width: 100%;
                max-width: 400px;
                max-height: 90vh;
                overflow-y: auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

    // Set form inner HTML with fields and error container
    form.innerHTML = `
                <h2 style="text-align:center; margin-bottom:20px; color:#333;">Send Feedback</h2>
                
                <div id="errorContainer" style="display:none;">
                    <p id="errorMessage"></p>
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; font-weight:500; color:#444;">Feedback Type</label>
                    <select id="type" required style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
                        <option value="suggestion">Suggestion</option>
                        <option value="complain">Complaint</option>
                        <option value="bug">Bug Report</option>
                    </select>
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; font-weight:500; color:#444;">Name</label>
                    <input type="text" id="name" style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; font-weight:500; color:#444;">Phone Number</label>
                    <input type="tel" id="phone_number" placeholder="08012345678" style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; font-weight:500; color:#444;">Message <span style="color:#e53e3e;">*</span></label>
                    <textarea id="message" rows="4" style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;"></textarea>
                </div>
                
                <div style="display:flex; gap:12px; margin-top:20px;">
                    <button type="submit" style="flex:1; padding:12px; background:#3182ce; color:white; border:none; border-radius:6px; font-weight:500; cursor:pointer;">Submit</button>
                    <button type="button" id="cancelFeedback" style="flex:1; padding:12px; background:#e2e8f0; color:#4a5568; border:none; border-radius:6px; font-weight:500; cursor:pointer;">Cancel</button>
                </div>
            `;

    // Add form to overlay and overlay to document
    overlay.appendChild(form);
    document.body.appendChild(overlay);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Cancel button closes the modal
    document.getElementById("cancelFeedback").addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "";
    });

    // Clicking outside the form closes the modal
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        document.body.style.overflow = "";
      }
    });

    // Handle form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = form.querySelector("button[type='submit']");
      const originalBtnText = btn.textContent;

      // Get form values
      const name = document.getElementById("name").value.trim();
      const phone_number = document.getElementById("phone_number").value.trim();
      const message = document.getElementById("message").value.trim();
      const type = document.getElementById("type").value;

      // Validate form fields
      if (!name) return showMessage("Name is required.");
      if (!phone_number) return showMessage("Phone number is required.");
      if (!/^(070|080|081|090|091)\d{8}$/.test(phone_number)) {
        return showMessage("Please enter a valid phone number");
      }
      if (!message) return showMessage("Message is required.");
      if (message.length < 4)
        return showMessage("Message must be at least 4 characters long.");

      try {
        // Show loading state on submit button
        btn.disabled = true;
        btn.textContent = "Sending...";
        btn.style.opacity = "0.7";

        // Get user role from localStorage or default to 'visitor'
        let role = localStorage.getItem("userType");
        if (!role) {
          role = "visitor";
        }

        // Prepare feedback data for API
        const feedbackData = { name, phone_number, message, type, role };

        // Send feedback to backend API
        const response = await fetch("http://localhost:5000/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackData),
        });

        const result = await response.json();

        // Handle API errors
        if (!response.ok) {
          throw new Error(result?.error || "Submission failed.");
        }

        // Show success message and close modal after short delay
        showMessage("Feedback submitted successfully! Thank you.", true);
        form.reset();
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = "";
        }, 1500);
      } catch (err) {
        // Show error message if API call fails
        showMessage("Server Error. Please try again.");
      } finally {
        // Restore submit button state
        btn.disabled = false;
        btn.textContent = originalBtnText;
        btn.style.opacity = "1";
      }
    });
  }

  // Attach click handler to feedback button/link if it exists
  if (contactUs) {
    contactUs.addEventListener("click", showFeedbackForm);
  }
});
