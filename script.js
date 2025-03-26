// Global variables
let currentStudents = [];
let eliminatedStudents = []; // Track eliminated students

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize localStorage with default classes if not already set
    initializeLocalStorage();
    
    // Add tab navigation
    setupTabNavigation();
    
    // Populate the class dropdown
    populateClassDropdown();
    
    // Set default class (first one in the list)
    const classList = getClassListFromStorage();
    if (classList && classList.length > 0) {
        loadClass(classList[0].id);
    }
    
    // Add event listener for class selection
    document.getElementById("classSelect").addEventListener("change", (e) => {
        loadClass(e.target.value);
    });
    
    // Add event listeners for buttons
    document.getElementById("selectRandomStudent").addEventListener("click", selectRandomStudent);
    document.getElementById("createGroups").addEventListener("click", createStudentGroups);
    document.getElementById("selectRandomStudentElimination").addEventListener("click", selectRandomStudentElimination);
    document.getElementById("resetEliminationList").addEventListener("click", resetEliminationList);
    document.getElementById("resetGroups").addEventListener("click", resetGroups);
});

// Setup tab navigation
function setupTabNavigation() {
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs-container";
    
    const studentSelectorTab = document.createElement("a");
    studentSelectorTab.href = "index.html";
    studentSelectorTab.className = "tab active";
    studentSelectorTab.textContent = "Student Selector";
    
    const editClassesTab = document.createElement("a");
    editClassesTab.href = "edit.html";
    editClassesTab.className = "tab";
    editClassesTab.textContent = "Edit Classes";
    
    tabsContainer.appendChild(studentSelectorTab);
    tabsContainer.appendChild(editClassesTab);
    
    // Insert tabs at the top of the page, after the h1
    const h1 = document.querySelector("h1");
    h1.parentNode.insertBefore(tabsContainer, h1.nextSibling);
}

// Initialize localStorage with default classes if not already set
function initializeLocalStorage() {
    // Check if classes already exist in localStorage
    if (!localStorage.getItem("classList")) {
        // Default class list
        const defaultClassList = [
            { id: "cPeriod", name: "C Period" },
            { id: "dPeriod", name: "D Period" },
            { id: "ePeriod", name: "E Period" },
            { id: "fPeriod", name: "F Period" }
        ];
        
        // Save to localStorage
        localStorage.setItem("classList", JSON.stringify(defaultClassList));
        
        // Default student data for each class
        const cPeriod = [
            { name: "Test Student A", gender: "G" },
            { name: "Test Student B", gender: "B" },
            { name: "Test Student C", gender: "G" },
            { name: "Test Student D", gender: "B" },
            { name: "Test Student E", gender: "G" },
            { name: "Test Student F", gender: "B" },
            { name: "Test Student G", gender: "G" },
            { name: "Test Student H", gender: "B" }
        ];
        
        const dPeriod = [
            { name: "Student 1", gender: "G" },
            { name: "Student 2", gender: "B" },
            { name: "Student 3", gender: "G" },
            { name: "Student 4", gender: "B" },
            { name: "Student 5", gender: "G" },
            { name: "Student 6", gender: "B" }
        ];
        
        const ePeriod = [
            { name: "Student A", gender: "G" },
            { name: "Student B", gender: "B" },
            { name: "Student C", gender: "G" },
            { name: "Student D", gender: "B" }
        ];
        
        const fPeriod = [
            { name: "Student Alpha", gender: "G" },
            { name: "Student Beta", gender: "B" },
            { name: "Student Gamma", gender: "G" },
            { name: "Student Delta", gender: "B" },
            { name: "Student Epsilon", gender: "G" }
        ];
        
        // Save each class to localStorage
        localStorage.setItem("cPeriod", JSON.stringify(cPeriod));
        localStorage.setItem("dPeriod", JSON.stringify(dPeriod));
        localStorage.setItem("ePeriod", JSON.stringify(ePeriod));
        localStorage.setItem("fPeriod", JSON.stringify(fPeriod));
    }
}

// Get class list from localStorage
function getClassListFromStorage() {
    const classListJson = localStorage.getItem("classList");
    return classListJson ? JSON.parse(classListJson) : [];
}

// Get students for a specific class from localStorage
function getStudentsForClass(classId) {
    const studentsJson = localStorage.getItem(classId);
    return studentsJson ? JSON.parse(studentsJson) : [];
}

// Populate the class dropdown with available classes
function populateClassDropdown() {
    const classSelect = document.getElementById("classSelect");
    
    // Clear existing options
    classSelect.innerHTML = "";
    
    // Get classes from localStorage
    const classList = getClassListFromStorage();
    
    // Add options for each class
    classList.forEach(classInfo => {
        const option = document.createElement("option");
        option.value = classInfo.id;
        option.textContent = classInfo.name;
        classSelect.appendChild(option);
    });
}

// Load a specific class by ID
function loadClass(classId) {
    // Get the class list from localStorage
    const classList = getClassListFromStorage();
    
    // Find the class in the list
    const classInfo = classList.find(c => c.id === classId);
    
    if (!classInfo) {
        console.error(`Class with ID ${classId} not found`);
        return;
    }
    
    // Get students for this class from localStorage
    currentStudents = getStudentsForClass(classId);
    
    // Update the display
    displayCurrentStudents();
    
    // Clear any previous results
    document.getElementById("results").innerHTML = "";
    
    // Reset the elimination list when changing classes
    eliminatedStudents = [];
    document.getElementById("eliminatedStudents").innerHTML = "";
}

// Display the current student list
function displayCurrentStudents() {
    const currentStudentsDiv = document.getElementById("currentStudents");
    currentStudentsDiv.innerHTML = "";
    
    if (currentStudents.length === 0) {
        currentStudentsDiv.innerHTML = "<p>No students in this class</p>";
        return;
    }
    
    // Create a student item for each student
    currentStudents.forEach(student => {
        const studentItem = document.createElement("div");
        studentItem.className = `student-item ${student.gender === "B" ? "boy" : "girl"}`;
        studentItem.textContent = student.name;
        currentStudentsDiv.appendChild(studentItem);
    });
}

// Select a random student
function selectRandomStudent() {
    if (currentStudents.length === 0) {
        alert("No students available in the current class");
        return;
    }
    
    const randomStudent = currentStudents[Math.floor(Math.random() * currentStudents.length)];
    displayRandomStudent(randomStudent);
}

// Display a randomly selected student
function displayRandomStudent(student) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="random-student">
            <h3>Random Student Selected:</h3>
            <p>${student.name}</p>
        </div>
    `;
}

// Select a random student in elimination mode
function selectRandomStudentElimination() {
    // Get the names of all eliminated students for easier comparison
    const eliminatedNames = eliminatedStudents.map(student => student.name);
    console.log("Current eliminated students:", eliminatedNames.join(", "));
    
    // Filter out already eliminated students
    const availableStudents = [];
    
    // Build a new array of available students
    for (const student of currentStudents) {
        if (!eliminatedNames.includes(student.name)) {
            availableStudents.push(student);
        } else {
            console.log(`${student.name} is already eliminated`);
        }
    }
    
    console.log("Available students:", availableStudents.map(s => s.name).join(", "));
    
    if (availableStudents.length === 0) {
        alert("All students have been eliminated. Reset the elimination list to continue.");
        return;
    }
    
    // Select a random student from available students
    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const randomStudent = availableStudents[randomIndex];
    
    console.log("Selected student:", randomStudent.name);
    
    // Display the selected student
    displayRandomStudent(randomStudent);
    
    // Add to eliminated students list (create a deep copy)
    eliminatedStudents.push({
        name: randomStudent.name,
        gender: randomStudent.gender
    });
    
    console.log("Updated eliminated students:", eliminatedStudents.map(s => s.name).join(", "));
    
    // Update the eliminated students display
    displayEliminatedStudents();
}

// Display the list of eliminated students
function displayEliminatedStudents() {
    const eliminatedStudentsDiv = document.getElementById("eliminatedStudents");
    eliminatedStudentsDiv.innerHTML = "";
    
    if (eliminatedStudents.length === 0) {
        eliminatedStudentsDiv.innerHTML = "<p>No students eliminated yet</p>";
        return;
    }
    
    // Create an element for each eliminated student
    eliminatedStudents.forEach(student => {
        const studentItem = document.createElement("div");
        studentItem.className = "eliminated-student";
        studentItem.textContent = student.name;
        eliminatedStudentsDiv.appendChild(studentItem);
    });
}

// Reset the elimination list
function resetEliminationList() {
    eliminatedStudents = [];
    displayEliminatedStudents();
}

// Reset the groups display
function resetGroups() {
    document.getElementById("results").innerHTML = "";
}

// Create student groups
function createStudentGroups() {
    if (currentStudents.length === 0) {
        alert("No students available in the current class");
        return;
    }
    
    const groupSize = parseInt(document.getElementById("groupSize").value);
    
    // Validate group size
    if (isNaN(groupSize) || groupSize < 1) {
        alert("Please enter a valid group size");
        return;
    }
    
    // Shuffle the students array
    const shuffledStudents = [...currentStudents].sort(() => Math.random() - 0.5);
    const groups = createGroups(shuffledStudents, groupSize);
    displayGroups(groups);
}

// Create groups with balanced gender distribution
function createGroups(students, requestedGroupSize) {
    if (requestedGroupSize >= students.length) {
        return [students];
    }

    // Calculate the optimal number of groups and sizes
    const totalStudents = students.length;
    const numGroups = Math.ceil(totalStudents / requestedGroupSize);
    
    // Calculate base size and how many groups need an extra student
    const baseGroupSize = Math.floor(totalStudents / numGroups);
    const numGroupsWithExtra = totalStudents % numGroups;
    
    // Create empty groups
    const groups = Array.from({ length: numGroups }, () => []);
    
    // Shuffle students while maintaining gender balance within each group
    let remainingStudents = [...students];
    
    // First, distribute students to maintain gender balance
    for (let groupIndex = 0; groupIndex < numGroups; groupIndex++) {
        const targetSize = groupIndex < numGroupsWithExtra ? baseGroupSize + 1 : baseGroupSize;
        let numGirls = 0;
        let numBoys = 0;
        
        while (groups[groupIndex].length < targetSize && remainingStudents.length > 0) {
            if (numGirls < numBoys) {
                // Try to add a girl
                const girlIndex = remainingStudents.findIndex(student => student.gender === "G");
                if (girlIndex >= 0) {
                    groups[groupIndex].push(remainingStudents[girlIndex]);
                    remainingStudents.splice(girlIndex, 1);
                    numGirls++;
                } else {
                    // No girls left, add a boy
                    const boyIndex = remainingStudents.findIndex(student => student.gender === "B");
                    if (boyIndex >= 0) {
                        groups[groupIndex].push(remainingStudents[boyIndex]);
                        remainingStudents.splice(boyIndex, 1);
                        numBoys++;
                    }
                }
            } else {
                // Try to add a boy
                const boyIndex = remainingStudents.findIndex(student => student.gender === "B");
                if (boyIndex >= 0) {
                    groups[groupIndex].push(remainingStudents[boyIndex]);
                    remainingStudents.splice(boyIndex, 1);
                    numBoys++;
                } else {
                    // No boys left, add a girl
                    const girlIndex = remainingStudents.findIndex(student => student.gender === "G");
                    if (girlIndex >= 0) {
                        groups[groupIndex].push(remainingStudents[girlIndex]);
                        remainingStudents.splice(girlIndex, 1);
                        numGirls++;
                    }
                }
            }
        }
    }
    
    // If any groups have only one student, redistribute
    const singleStudentGroups = groups.filter(group => group.length === 1);
    if (singleStudentGroups.length > 0) {
        // Find the smallest group that's not a single-student group
        const nonSingleGroups = groups.filter(group => group.length > 1);
        nonSingleGroups.sort((a, b) => a.length - b.length);
        
        // Move students from single groups to the smallest non-single group
        singleStudentGroups.forEach(singleGroup => {
            nonSingleGroups[0].push(singleGroup[0]);
            // Remove the single student group
            const index = groups.indexOf(singleGroup);
            if (index > -1) {
                groups.splice(index, 1);
            }
        });
    }
    
    return groups;
}

// Display the created groups
function displayGroups(groups) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    groups.forEach((group, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
        groupDiv.innerHTML = `<h3>Group ${index + 1}</h3>`;
        
        group.forEach(student => {
            const studentElement = document.createElement("p");
            studentElement.textContent = student.name;
            groupDiv.appendChild(studentElement);
        });
        
        resultsDiv.appendChild(groupDiv);
    });
}
