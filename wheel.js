// Global variables
let theWheel;
let wheelOptions = [];

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Add tab navigation
    setupTabNavigation();
    
    // Load saved wheel options if available
    loadWheelOptions();
    
    // Initialize the wheel
    createWheel();
    
    // Add event listeners
    document.getElementById("updateWheel").addEventListener("click", updateWheelFromInput);
    document.getElementById("spinWheel").addEventListener("click", startSpin);
    document.getElementById("resetWheel").addEventListener("click", resetWheel);
});

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

// Create the wheel with current options
function createWheel() {
    // Create segments array for the wheel
    const segments = [];
    
    // Define 5 distinct colors for the wheel segments
    const colors = ['#4CAF50', '#007bff', '#ff9800', '#9c27b0', '#f44336'];
    
    // Add a segment for each option with cycling colors
    wheelOptions.forEach((option, index) => {
        segments.push({
            'text': option,
            'fillStyle': colors[index % colors.length]
        });
    });
    
    // Create the wheel
    theWheel = new Winwheel({
        'canvasId': 'wheelCanvas',
        'numSegments': segments.length,
        'segments': segments,
        'outerRadius': 180,
        'textFontSize': 16,
        'textMargin': 10,
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
        document.getElementById("wheelResult").innerHTML = `
            <div class="random-student">
                <h3>Selected Option:</h3>
                <p>${indicatedSegment.text}</p>
            </div>
        `;
    }
}
