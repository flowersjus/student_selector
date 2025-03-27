// Global variables
let theWheel;
let wheelOptions = [];

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Add tab navigation
    setupTabNavigation();
    
    // Load saved wheel options if available
    loadWheelOptions();
    
    // Set canvas dimensions
    resizeCanvas();
    
    // Initialize the wheel
    createWheel();
    
    // Add event listeners
    document.getElementById("updateWheel").addEventListener("click", updateWheelFromInput);
    document.getElementById("spinWheel").addEventListener("click", startSpin);
    document.getElementById("resetWheel").addEventListener("click", resetWheel);
    
    // Add resize listener
    window.addEventListener("resize", debounce(() => {
        resizeCanvas();
        createWheel();
    }, 250));
});

// Debounce function to limit resize events
function debounce(func, wait) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
    };
}

// Set canvas dimensions based on container
function resizeCanvas() {
    const container = document.querySelector('.wheel-indicator-container');
    const canvas = document.getElementById('wheelCanvas');
    
    // Get container dimensions accounting for padding (15px on each side)
    const containerWidth = container.clientWidth - 30; // Subtract padding (15px * 2)
    
    // Set canvas dimensions to match container (maintain square aspect)
    canvas.width = containerWidth;
    canvas.height = containerWidth;
}

// Setup tab navigation
function setupTabNavigation() {
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs-container";
    
    const studentSelectorTab = document.createElement("a");
    studentSelectorTab.href = "index.html";
    studentSelectorTab.className = "tab";
    studentSelectorTab.textContent = "Student Selector";
    
    const editClassesTab = document.createElement("a");
    editClassesTab.href = "edit.html";
    editClassesTab.className = "tab";
    editClassesTab.textContent = "Edit Classes";
    
    const wheelSelectorTab = document.createElement("a");
    wheelSelectorTab.href = "wheel.html";
    wheelSelectorTab.className = "tab active";
    wheelSelectorTab.textContent = "Wheel Selector";
    
    tabsContainer.appendChild(studentSelectorTab);
    tabsContainer.appendChild(editClassesTab);
    tabsContainer.appendChild(wheelSelectorTab);
    
    // Insert tabs at the top of the page, after the h1
    const h1 = document.querySelector("h1");
    h1.parentNode.insertBefore(tabsContainer, h1.nextSibling);
}

// Load wheel options from localStorage
function loadWheelOptions() {
    const savedOptions = localStorage.getItem("wheelOptions");
    if (savedOptions) {
        wheelOptions = JSON.parse(savedOptions);
        
        // Update the textarea with saved options
        const optionsText = wheelOptions.join("\n");
        document.getElementById("wheelOptions").value = optionsText;
    } else {
        // Set default options
        wheelOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
        document.getElementById("wheelOptions").value = wheelOptions.join("\n");
    }
}

// Helper function to truncate text with ellipsis if needed
function truncateText(text, maxLength) {
    // Ensure minimum length of 8 characters
    maxLength = Math.max(maxLength || 15, 8);
    return text.length > maxLength ? text.substring(0, maxLength-3) + '...' : text;
}

// Create the wheel with current options
function createWheel() {
    // Create segments array for the wheel
    const segments = [];
    
    // Define 5 distinct colors for the wheel segments
    const colors = ['#4CAF50', '#007bff', '#ff9800', '#9c27b0', '#f44336'];
    
    // Get canvas dimensions
    const canvas = document.getElementById('wheelCanvas');
    const wheelSize = canvas.width;
    
    // Calculate dynamic font size (3.5% of wheel diameter, min 12px, max 24px)
    const fontSize = Math.max(12, Math.min(24, Math.floor(wheelSize * 0.035)));
    
    // Calculate text margin based on font size
    const textMargin = Math.floor(fontSize * 0.7);
    
    // Calculate max text length based on wheel size and number of segments
    // More segments = less space per segment = shorter text
    const segmentFactor = Math.max(1, wheelOptions.length / 6); // More aggressive segment factor
    const maxTextLength = Math.floor((wheelSize * 0.05) / (segmentFactor * (fontSize / 14)));
    
    // Add a segment for each option with cycling colors
    wheelOptions.forEach((option, index) => {
        segments.push({
            'text': truncateText(option, maxTextLength),
            'fillStyle': colors[index % colors.length],
            // Store original text in case needed later
            'fullText': option
        });
    });

    theWheel = new Winwheel({
        'canvasId': 'wheelCanvas',
        'numSegments': segments.length,
        'segments': segments,
        'responsive': true,
        'textFontSize': fontSize, // Dynamic font size
        'textMargin': textMargin, // Dynamic margin
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': alertPrize
        }
    });
    
    // Draw the wheel
    theWheel.draw();
}

// Update the wheel based on textarea input
function updateWheelFromInput() {
    const optionsText = document.getElementById("wheelOptions").value;
    
    // Split by new line and filter out empty lines
    wheelOptions = optionsText.split("\n").filter(option => option.trim() !== "");
    
    if (wheelOptions.length === 0) {
        alert("Please enter at least one option for the wheel.");
        return;
    }
    
    // Save to localStorage
    localStorage.setItem("wheelOptions", JSON.stringify(wheelOptions));
    
    // Recreate the wheel
    createWheel();
}

// Start spinning the wheel
function startSpin() {
    // Always reset the wheel before spinning again to ensure a full spin
    resetWheel();
    
    // Use setTimeout to ensure the reset is complete before starting the animation
    setTimeout(() => {
        // Create a new animation object to ensure a fresh spin
        theWheel.animation.stopAngle = null;
        theWheel.startAnimation();
    }, 100);
}

// Reset the wheel
function resetWheel() {
    // Stop any ongoing animation
    theWheel.stopAnimation(false);
    
    // Reset the rotation angle and clear any animation state
    theWheel.rotationAngle = 0;
    
    // Redraw the wheel in its initial state
    theWheel.draw();
    
    // Clear the result display
    document.getElementById("wheelResult").innerHTML = "";
}

// Callback function for when the wheel stops
function alertPrize(indicatedSegment) {
    if (indicatedSegment) {
        const selectedOption = indicatedSegment.fullText || indicatedSegment.text;
        const shouldRemove = confirm(`Selected: ${selectedOption}\n\nRemove this option from wheel?`);
        
        if (shouldRemove) {
            // Remove the selected option using full text if available
            wheelOptions = wheelOptions.filter(opt => opt !== (indicatedSegment.fullText || indicatedSegment.text));
            localStorage.setItem("wheelOptions", JSON.stringify(wheelOptions));
            document.getElementById("wheelOptions").value = wheelOptions.join("\n");
            createWheel();
        }

        document.getElementById("wheelResult").innerHTML = `
            <div class="random-student">
                <h3>Selected Option:</h3>
                <p>${indicatedSegment.fullText || indicatedSegment.text}</p>
            </div>
        `;
    }
}
