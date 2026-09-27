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

// ================================
// ЗАГРУЗКА ГРУПП
// ================================

function loadGroups() {

    groupSelect.innerHTML = `
        <option value="">Выберите группу</option>
    `;

    scheduleData.groups.forEach(group => {

        const option = document.createElement("option");

        option.value = group.grp;
        option.textContent = group.grp;

        groupSelect.appendChild(option);
    });
}


// ================================
// ВЫБОР ГРУППЫ
// ================================

groupSelect.addEventListener("change", () => {

    const selectedGroup = groupSelect.value;

    if (!selectedGroup) {
        scheduleContainer.innerHTML = "";
        return;
    }

    showSchedule(selectedGroup);
});


// ================================
// ВЫВОД РАСПИСАНИЯ
// ================================

function showSchedule(group) {

    scheduleContainer.innerHTML = "";

    const days = [
        {
            number: 1,
            name: "Понедельник"
        },
        {
            number: 2,
            name: "Вторник"
        },
        {
            number: 3,
            name: "Среда"
        },
        {
            number: 4,
            name: "Четверг"
        },
        {
            number: 5,
            name: "Пятница"
        },
        {
            number: 6,
            name: "Суббота"
        }
    ];


    days.forEach(day => {

        // Находим занятия этой группы в этот день
        const lessons = scheduleData.schedule.filter(lesson => {

            return (
                lesson.wd === day.number &&
                lesson.sg.includes(group)
            );

        });


        // Сортировка по времени
        lessons.sort((a, b) => {

            return a.ts.localeCompare(b.ts);

        });


        const dayElement = document.createElement("div");

        dayElement.className = "day";


        dayElement.innerHTML = `
            <h2>${day.name}</h2>
        `;


        // Если пар нет
        if (lessons.length === 0) {

            dayElement.innerHTML += `
                <p>Пар нет</p>
            `;

        } else {

            lessons.forEach(lesson => {

                const lessonElement = document.createElement("div");

                lessonElement.className = "lesson";


                lessonElement.innerHTML = `
                    <div class="lesson-time">
                        ${lesson.ts}–${lesson.te}
                    </div>

                    <div class="lesson-subject">
                        ${lesson.ln}
                    </div>

                    <div class="lesson-info">
                        ${getLessonType(lesson.lt)}
                    </div>

                    <div class="lesson-info">
                        ${lesson.tn}
                    </div>

                    <div class="lesson-info">
                        ${lesson.loc}
                    </div>

                    <div class="lesson-info">
                        Недели: ${lesson.ws}
                    </div>
                `;


                dayElement.appendChild(lessonElement);
            });
        }


        scheduleContainer.appendChild(dayElement);

    });
}


// ================================
// ТИП ЗАНЯТИЯ
// ================================

function getLessonType(type) {

    switch (type) {

        case 102:
            return "Лекция";

        case 103:
            return "Практика";

        default:
            return `Тип занятия: ${type}`;
    }
}


// ================================
// ЗАПУСК
// ================================

loadSchedule();
