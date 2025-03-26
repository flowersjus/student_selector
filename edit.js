// Global variables
let classList = [];
let currentClassId = null;
let currentStudents = [];
let hasUnsavedChanges = false;

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Add tab navigation
    setupTabNavigation();
    
    // Load classes from localStorage
    loadClassesFromStorage();
    
    // Set up event listeners
    document.getElementById("addClassButton").addEventListener("click", addNewClass);
    document.getElementById("addStudentButton").addEventListener("click", addNewStudent);
    document.getElementById("saveChangesButton").addEventListener("click", saveAllChanges);
    document.getElementById("editClassSelect").addEventListener("change", (e) => {
        if (hasUnsavedChanges) {
            if (confirm("You have unsaved changes. Do you want to continue without saving?")) {
                loadStudentsForClass(e.target.value);
            } else {
                // Reset the select to the previous value
                document.getElementById("editClassSelect").value = currentClassId;
            }
        } else {
            loadStudentsForClass(e.target.value);
        }
    });
    
    // Handle beforeunload event to warn about unsaved changes
    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            return e.returnValue;
        }
    });
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
    editClassesTab.className = "tab active";
    editClassesTab.textContent = "Edit Classes";
    
    tabsContainer.appendChild(studentSelectorTab);
    tabsContainer.appendChild(editClassesTab);
    
    // Insert tabs at the top of the page, after the h1
    const h1 = document.querySelector("h1");
    h1.parentNode.insertBefore(tabsContainer, h1.nextSibling);
}

// Load classes from localStorage
function loadClassesFromStorage() {
    // Get class list from localStorage
    const classListJson = localStorage.getItem("classList");
    classList = classListJson ? JSON.parse(classListJson) : [];
    
    // Display classes in the editor
    displayClassList();
    
    // Populate the class dropdown
    populateClassDropdown();
    
    // Load students for the first class if available
    if (classList.length > 0) {
        loadStudentsForClass(classList[0].id);
    }
}

// Display the class list in the editor
function displayClassList() {
    const classListEditor = document.getElementById("classListEditor");
    classListEditor.innerHTML = "";
    
    if (classList.length === 0) {
        classListEditor.innerHTML = "<p>No classes available. Add a new class to get started.</p>";
        return;
    }
    
    // Create an editor item for each class
    classList.forEach((classInfo, index) => {
        const classItem = document.createElement("div");
        classItem.className = "class-item";
        
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "class-name-input";
        nameInput.value = classInfo.name;
        nameInput.dataset.classId = classInfo.id;
        nameInput.addEventListener("input", () => {
            // Update the class name in the list
            classList[index].name = nameInput.value;
            
            // Update the dropdown
            const option = document.querySelector(`#editClassSelect option[value="${classInfo.id}"]`);
            if (option) {
                option.textContent = nameInput.value;
            }
            
            hasUnsavedChanges = true;
        });
        
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete the class "${classInfo.name}"? This will also delete all students in this class.`)) {
                // Remove the class from the list
                classList.splice(index, 1);
                
                // Remove the class's students from localStorage
                localStorage.removeItem(classInfo.id);
                
                // Update the display
                displayClassList();
                populateClassDropdown();
                
                // If this was the current class, load another one
                if (currentClassId === classInfo.id) {
                    if (classList.length > 0) {
                        loadStudentsForClass(classList[0].id);
                    } else {
                        currentClassId = null;
                        currentStudents = [];
                        displayStudentList();
                    }
                }
                
                hasUnsavedChanges = true;
            }
        });
        
        classItem.appendChild(nameInput);
        classItem.appendChild(deleteButton);
        classListEditor.appendChild(classItem);
    });
}

// Populate the class dropdown
function populateClassDropdown() {
    const editClassSelect = document.getElementById("editClassSelect");
    
    // Clear existing options
    editClassSelect.innerHTML = "";
    
    if (classList.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No classes available";
        option.disabled = true;
        editClassSelect.appendChild(option);
        editClassSelect.disabled = true;
        document.getElementById("addStudentButton").disabled = true;
        return;
    }
    
    // Enable the select and add student button
    editClassSelect.disabled = false;
    document.getElementById("addStudentButton").disabled = false;
    
    // Add options for each class
    classList.forEach(classInfo => {
        const option = document.createElement("option");
        option.value = classInfo.id;
        option.textContent = classInfo.name;
        editClassSelect.appendChild(option);
    });
    
    // Set the current class if available
    if (currentClassId) {
        editClassSelect.value = currentClassId;
    }
}

// Load students for a specific class
function loadStudentsForClass(classId) {
    // Get students from localStorage
    const studentsJson = localStorage.getItem(classId);
    currentStudents = studentsJson ? JSON.parse(studentsJson) : [];
    currentClassId = classId;
    
    // Display students in the editor
    displayStudentList();
    
    // Reset unsaved changes flag
    hasUnsavedChanges = false;
}

// Display the student list in the editor
function displayStudentList() {
    const studentListEditor = document.getElementById("studentListEditor");
    studentListEditor.innerHTML = "";
    
    if (!currentClassId) {
        studentListEditor.innerHTML = "<p>Please select a class to edit students.</p>";
        return;
    }
    
    if (currentStudents.length === 0) {
        studentListEditor.innerHTML = "<p>No students in this class. Add a new student to get started.</p>";
    }
    
    // Create an editor item for each student
    currentStudents.forEach((student, index) => {
        const studentItem = document.createElement("div");
        studentItem.className = `student-item-editor ${student.gender === "B" ? "boy" : "girl"}`;
        
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "student-name-input";
        nameInput.value = student.name;
        nameInput.addEventListener("input", () => {
            // Update the student name
            currentStudents[index].name = nameInput.value;
            hasUnsavedChanges = true;
        });
        
        const genderSelect = document.createElement("select");
        genderSelect.className = "gender-select";
        
        const boyOption = document.createElement("option");
        boyOption.value = "B";
        boyOption.textContent = "Boy";
        
        const girlOption = document.createElement("option");
        girlOption.value = "G";
        girlOption.textContent = "Girl";
        
        genderSelect.appendChild(boyOption);
        genderSelect.appendChild(girlOption);
        genderSelect.value = student.gender;
        
        genderSelect.addEventListener("change", () => {
            // Update the student gender
            currentStudents[index].gender = genderSelect.value;
            
            // Update the class of the student item
            studentItem.className = `student-item-editor ${genderSelect.value === "B" ? "boy" : "girl"}`;
            
            hasUnsavedChanges = true;
        });
        
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            // Remove the student from the list
            currentStudents.splice(index, 1);
            
            // Update the display
            displayStudentList();
            
            hasUnsavedChanges = true;
        });
        
        studentItem.appendChild(nameInput);
        studentItem.appendChild(genderSelect);
        studentItem.appendChild(deleteButton);
        studentListEditor.appendChild(studentItem);
    });
}

// Add a new class
function addNewClass() {
    // Generate a unique ID for the new class
    const newId = "class_" + Date.now();
    
    // Create a new class object
    const newClass = {
        id: newId,
        name: "New Class"
    };
    
    // Add to the class list
    classList.push(newClass);
    
    // Initialize empty student list for this class
    localStorage.setItem(newId, JSON.stringify([]));
    
    // Update the display
    displayClassList();
    populateClassDropdown();
    
    // Select the new class
    document.getElementById("editClassSelect").value = newId;
    loadStudentsForClass(newId);
    
    hasUnsavedChanges = true;
}

// Add a new student to the current class
function addNewStudent() {
    if (!currentClassId) {
        alert("Please select a class first.");
        return;
    }
    
    // Create a new student object
    const newStudent = {
        name: "New Student",
        gender: "B" // Default to boy
    };
    
    // Add to the current students list
    currentStudents.push(newStudent);
    
    // Update the display
    displayStudentList();
    
    hasUnsavedChanges = true;
}

// Save all changes to localStorage
function saveAllChanges() {
    // Save the class list
    localStorage.setItem("classList", JSON.stringify(classList));
    
    // Save the current students
    if (currentClassId) {
        localStorage.setItem(currentClassId, JSON.stringify(currentStudents));
    }
    
    // Reset unsaved changes flag
    hasUnsavedChanges = false;
    
    alert("All changes have been saved successfully!");
}
