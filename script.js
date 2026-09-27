const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = {};

async function loadSchedule() {
    try {
        const response = await fetch(
            "https://ssg18.github.io/raspisanie-test/schedule.json"
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        scheduleData = await response.json();

        console.log("Расписание загружено:", scheduleData);

        loadGroups();

    } catch (error) {
        console.error("Ошибка загрузки:", error);

        scheduleContainer.innerHTML = `
            <p style="color:red;">
                Ошибка загрузки расписания: ${error.message}
            </p>
        `;
    }
}

function loadGroups() {

    Object.keys(scheduleData)
        .sort()
        .forEach(group => {

            const option = document.createElement("option");

            option.value = group;
            option.textContent = group;

            groupSelect.appendChild(option);
        });
}

groupSelect.addEventListener("change", () => {

    const group = groupSelect.value;

    if (!group) {
        scheduleContainer.innerHTML = "";
        return;
    }

    showSchedule(group);
});

function showSchedule(group) {

    const schedule = scheduleData[group];

    scheduleContainer.innerHTML = "";

    const days = [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота"
    ];

    days.forEach(day => {

        const lessons = schedule[day] || [];

        const dayElement = document.createElement("div");

        dayElement.className = "day";

        dayElement.innerHTML = `
            <h2>${day}</h2>
        `;

        if (lessons.length === 0) {

            dayElement.innerHTML += `
                <p>Пар нет</p>
            `;

        } else {

            lessons.forEach(lesson => {

                dayElement.innerHTML += `
                    <div class="lesson">

                        <div class="lesson-time">
                            ${lesson.time}
                        </div>

                        <div class="lesson-subject">
                            ${lesson.subject}
                        </div>

                        <div class="lesson-info">
                            ${lesson.type || ""}
                        </div>

                        <div class="lesson-info">
                            ${lesson.teacher || ""}
                        </div>

                        <div class="lesson-info">
                            ${lesson.room || ""}
                        </div>

                    </div>
                `;
            });
        }

        scheduleContainer.appendChild(dayElement);
    });
}

loadSchedule();
