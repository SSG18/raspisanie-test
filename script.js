const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = null;


// ===============================
// Загрузка расписания
// ===============================

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

        fillGroups();

    } catch (error) {
        console.error("Ошибка загрузки:", error);

        scheduleContainer.innerHTML = `
            <p style="color:red;">
                Ошибка загрузки расписания: ${error.message}
            </p>
        `;
    }
}


// ===============================
// Заполнение списка групп
// ===============================

function fillGroups() {

    console.log("Заполняем список групп...");

    groupSelect.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Выберите группу";

    groupSelect.appendChild(defaultOption);


    // Берём группы из scheduleData.groups
    scheduleData.groups.forEach(group => {

        const option = document.createElement("option");

        option.value = group.grp;
        option.textContent = group.grp;

        groupSelect.appendChild(option);

    });


    console.log(
        "Группы загружены:",
        scheduleData.groups.map(group => group.grp)
    );
}


// ===============================
// Выбор группы
// ===============================

groupSelect.addEventListener("change", function () {

    const group = this.value;

    console.log("Выбрана группа:", group);

    if (!group) {

        scheduleContainer.innerHTML = "";

        return;
    }

    showSchedule(group);

});


// ===============================
// Отображение расписания
// ===============================

function showSchedule(group) {

    console.log("Показываем расписание группы:", group);

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

        // Ищем занятия этой группы в этот день
        const lessons = scheduleData.schedule.filter(lesson => {

            return (
                Number(lesson.wd) === day.number &&
                Array.isArray(lesson.sg) &&
                lesson.sg.includes(group)
            );

        });


        // Сортировка по времени
        lessons.sort((a, b) => {

            return a.ts.localeCompare(b.ts);

        });


        // Создаём блок дня
        const dayElement = document.createElement("div");

        dayElement.className = "day";


        // Заголовок дня
        const title = document.createElement("h2");

        title.textContent = day.name;

        dayElement.appendChild(title);


        // Если пар нет
        if (lessons.length === 0) {

            const empty = document.createElement("p");

            empty.textContent = "Пар нет";

            dayElement.appendChild(empty);

        }


        // Вывод занятий
        lessons.forEach(lesson => {

            const lessonElement = document.createElement("div");

            lessonElement.className = "lesson";


            // Время
            const time = document.createElement("div");

            time.className = "lesson-time";

            time.textContent =
                `${lesson.ts}–${lesson.te}`;


            // Предмет
            const subject = document.createElement("div");

            subject.className = "lesson-subject";

            subject.textContent = lesson.ln;


            // Тип занятия
            const type = document.createElement("div");

            type.className = "lesson-info";

            type.textContent =
                getLessonType(lesson.lt);


            // Преподаватель
            const teacher = document.createElement("div");

            teacher.className = "lesson-info";

            teacher.textContent =
                lesson.tn || "";


            // Кабинет
            const room = document.createElement("div");

            room.className = "lesson-info";

            room.textContent =
                lesson.loc || "";


            // Недели
            const weeks = document.createElement("div");

            weeks.className = "lesson-info";

            weeks.textContent =
                `Недели: ${lesson.ws || "все"}`;


            lessonElement.appendChild(time);

            lessonElement.appendChild(subject);

            lessonElement.appendChild(type);

            lessonElement.appendChild(teacher);

            lessonElement.appendChild(room);

            lessonElement.appendChild(weeks);


            dayElement.appendChild(lessonElement);

        });


        scheduleContainer.appendChild(dayElement);

    });

}


// ===============================
// Тип занятия
// ===============================

function getLessonType(type) {

    if (Number(type) === 102) {
        return "Лекция";
    }

    if (Number(type) === 103) {
        return "Практика";
    }

    return `Тип занятия: ${type}`;
}


// ===============================
// Запуск
// ===============================

loadSchedule();
