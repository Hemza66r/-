// الحصول على عناصر الصفحة
const skipBtn = document.getElementById('skipBtn');
const welcomeScreen = document.getElementById('welcome-screen');
const appScreen = document.getElementById('app-screen');
const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskChart = document.getElementById('taskChart');

let chartInstance;

// التحقق من الزيارة الأولى
if (!localStorage.getItem('firstVisitDone')) {
    welcomeScreen.style.display = 'block';
    appScreen.style.display = 'none';
} else {
    welcomeScreen.style.display = 'none';
    appScreen.style.display = 'block';
}

// عند الضغط على زر "تخطي"
skipBtn.addEventListener('click', () => {
    localStorage.setItem('firstVisitDone', 'true');
    welcomeScreen.style.display = 'none';
    appScreen.style.display = 'block';
});

// إضافة مهمة جديدة
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const taskDueTime = taskTime.value;

    if (!taskText || !taskDueTime) {
        alert('Please enter both task and time!');
        return;
    }

    const taskItem = createTaskItem(taskText, taskDueTime);
    taskList.insertBefore(taskItem, taskList.firstChild); // إضافة المهمة في الأعلى
    taskInput.value = '';
    taskTime.value = '';
    saveTasksToStorage();
    updateChart();
});

// إنشاء عنصر مهمة
function createTaskItem(text, dueTime, completed = false, deleted = false) {
    const taskItem = document.createElement('li');
    taskItem.textContent = `${text} - Due at ${dueTime}`;

    if (completed) taskItem.classList.add('completed');
    if (deleted) taskItem.classList.add('deleted');

    // زر ✔️
    const checkBtn = document.createElement('button');
    checkBtn.textContent = '✔️';
    checkBtn.classList.add('check-btn');
    checkBtn.disabled = completed || deleted;
    checkBtn.addEventListener('click', () => {
        taskItem.classList.add('completed');
        checkBtn.disabled = true;
        deleteBtn.disabled = true;
        saveTasksToStorage();
        updateChart();
    });

    // زر ❌
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.disabled = completed || deleted;
    deleteBtn.addEventListener('click', () => {
        taskItem.classList.add('deleted');
        checkBtn.disabled = true;
        deleteBtn.disabled = true;
        saveTasksToStorage();
        updateChart();
    });

    taskItem.appendChild(checkBtn);
    taskItem.appendChild(deleteBtn);

    return taskItem;
}

// حفظ المهام في localStorage
function saveTasksToStorage() {
    const tasks = [];
    const taskItems = document.querySelectorAll('#taskList li');

    taskItems.forEach(item => {
        const taskText = item.textContent.split(' - ')[0];
        const isCompleted = item.classList.contains('completed');
        const isDeleted = item.classList.contains('deleted');
        tasks.push({
            text: taskText,
            completed: isCompleted,
            deleted: isDeleted,
        });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// استرجاع المهام من localStorage
function loadTasksFromStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.forEach(task => {
        const taskItem = createTaskItem(
            task.text,
            'time', // افتراضي لتجنب الخطأ (يمكنك تحسينه لاحقًا)
            task.completed,
            task.deleted
        );
        taskList.appendChild(taskItem);
    });

    updateChart();
}

// تحديث الرسم البياني
function updateChart() {
    const totalTasks = taskList.children.length;
    const completedTasks = document.querySelectorAll('.completed').length;
    const deletedTasks = document.querySelectorAll('.deleted').length;
    const pendingTasks = totalTasks - completedTasks - deletedTasks;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(taskChart, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Deleted', 'Pending'],
            datasets: [{
                data: [completedTasks, deletedTasks, pendingTasks],
                backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
                borderColor: ['#388e3c', '#d32f2f', '#1976d2'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });
}

// تحميل المهام عند تشغيل الصفحة
document.addEventListener('DOMContentLoaded', loadTasksFromStorage);