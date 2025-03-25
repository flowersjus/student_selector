// Global variables
let currentStudents = [];
let eliminatedStudents = []; // Track eliminated students

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Populate the class dropdown
    populateClassDropdown();
    
    // Set default class (first one in the list)
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

// Populate the class dropdown with available classes
function populateClassDropdown() {
    const classSelect = document.getElementById("classSelect");
    
    // Clear existing options
    classSelect.innerHTML = "";
    
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
    // Find the class in the list
    const classInfo = classList.find(c => c.id === classId);
    
    if (!classInfo) {
        console.error(`Class with ID ${classId} not found`);
        return;
    }
    
    // Set the current students based on the class ID
    switch (classId) {
        case "dPeriod":
            currentStudents = [...dPeriod];
            break;
        case "cPeriod":
            currentStudents = [...cPeriod];
            break;
        case "ePeriod":
            currentStudents = [...ePeriod];
            break;
        case "fPeriod":
            currentStudents = [...fPeriod];
            break;
        default:
            console.error(`Unknown class ID: ${classId}`);
            return;
    }
    
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
