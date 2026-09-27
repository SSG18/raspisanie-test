// ==========================================
// КГМУ — РАСПИСАНИЕ
// ==========================================

// Получаем элементы страницы
const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

// Единственная переменная с данными расписания
let scheduleData = null;


// ==========================================
// ЗАГРУЗКА РАСПИСАНИЯ
// ==========================================

async function loadSchedule() {

    try {

        console.log("Начинаем загрузку расписания...");

        const response = await fetch(
            "https://ssg18.github.io/raspisanie-test/schedule.json"
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        // Сохраняем JSON
        scheduleData = json;

        console.log("Расписание загружено:", scheduleData);

        // Проверяем структуру
        if (!scheduleData) {
            throw new Error("JSON пустой");
        }

        if (!Array.isArray(scheduleData.groups)) {
            throw new Error("В JSON отсутствует массив groups");
        }

        if (!Array.isArray(scheduleData.schedule)) {
            throw new Error("В JSON отсутствует массив schedule");
        }

        console.log(
            "Количество групп:",
            scheduleData.groups.length
        );

        console.log(
            "Количество занятий:",
            scheduleData.schedule.length
        );


        // Заполняем группы
        fillGroups();


    } catch (error) {

        console.error(
            "Ошибка загрузки:",
            error
        );

        scheduleContainer.innerHTML = `
            <p style="color:red;">
                Ошибка загрузки расписания:
                ${error.message}
            </p>
        `;

    }

}


// ==========================================
// ЗАПОЛНЕНИЕ СПИСКА ГРУПП
// ==========================================

function fillGroups() {

    console.log("Начинаем заполнение групп...");

    // На всякий случай полностью очищаем список
    groupSelect.replaceChildren();


    // Пункт по умолчанию
    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent =
        "Выберите группу";

    groupSelect.appendChild(defaultOption);


    // Проверяем данные
    if (
        !scheduleData ||
        !Array.isArray(scheduleData.groups)
    ) {

        console.error(
            "Не удалось получить список групп"
        );

        return;
    }


    // Добавляем группы
    scheduleData.groups.forEach(group => {

        if (!group || !group.grp) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = String(group.grp);

        option.textContent =
            String(group.grp);

        groupSelect.appendChild(option);

    });


    console.log(
        "Группы загружены:",
        scheduleData.groups.map(
            group => group.grp
        )
    );

}


// ==========================================
// ВЫБОР ГРУППЫ
// ==========================================

groupSelect.addEventListener(
    "change",
    function () {

        const selectedGroup =
            String(this.value);

        console.log(
            "Выбрана группа:",
            selectedGroup
        );


        // Если группа не выбрана
        if (!selectedGroup) {

            scheduleContainer.innerHTML = "";

            return;
        }


        // Показываем расписание
        showSchedule(selectedGroup);

    }
);


// ==========================================
// ОТОБРАЖЕНИЕ РАСПИСАНИЯ
// ==========================================

function showSchedule(group) {

    console.log(
        "Показываем расписание группы:",
        group
    );


    // Очищаем предыдущий результат
    scheduleContainer.innerHTML = "";


    // Дни недели
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


    // Создаём каждый день
    days.forEach(day => {


        // Получаем занятия группы
        // в конкретный день
        const lessons =
            scheduleData.schedule.filter(
                lesson => {

                    if (!lesson) {
                        return false;
                    }


                    const correctDay =
                        Number(lesson.wd) ===
                        day.number;


                    const correctGroup =
                        Array.isArray(lesson.sg) &&
                        lesson.sg.some(
                            item =>
                                String(item) ===
                                String(group)
                        );


                    return (
                        correctDay &&
                        correctGroup
                    );

                }
            );


        // Сортируем по времени
        lessons.sort(
            (a, b) => {

                return String(a.ts || "")
                    .localeCompare(
                        String(b.ts || "")
                    );

            }
        );


        // Создаём блок дня
        const dayElement =
            document.createElement("div");

        dayElement.className =
            "day";


        // Заголовок дня
        const title =
            document.createElement("h2");

        title.textContent =
            day.name;

        dayElement.appendChild(title);


        // Если пар нет
        if (lessons.length === 0) {

            const empty =
                document.createElement("p");

            empty.textContent =
                "Пар нет";

            dayElement.appendChild(empty);

        }


        // Добавляем пары
        lessons.forEach(
            lesson => {

                const lessonElement =
                    document.createElement("div");

                lessonElement.className =
                    "lesson";


                // Время
                const time =
                    document.createElement("div");

                time.className =
                    "lesson-time";

                time.textContent =
                    `${lesson.ts || ""}–${lesson.te || ""}`;


                // Предмет
                const subject =
                    document.createElement("div");

                subject.className =
                    "lesson-subject";

                subject.textContent =
                    lesson.ln || "Без названия";


                // Тип занятия
                const type =
                    document.createElement("div");

                type.className =
                    "lesson-info";

                type.textContent =
                    getLessonType(lesson.lt);


                // Преподаватель
                const teacher =
                    document.createElement("div");

                teacher.className =
                    "lesson-info";

                teacher.textContent =
                    lesson.tn || "Преподаватель не указан";


                // Аудитория
                const room =
                    document.createElement("div");

                room.className =
                    "lesson-info";

                room.textContent =
                    lesson.loc || "Аудитория не указана";


                // Недели
                const weeks =
                    document.createElement("div");

                weeks.className =
                    "lesson-info";

                weeks.textContent =
                    lesson.ws
                        ? `Недели: ${lesson.ws}`
                        : "Недели: все";


                // Добавляем всё в карточку
                lessonElement.appendChild(time);

                lessonElement.appendChild(subject);

                lessonElement.appendChild(type);

                lessonElement.appendChild(teacher);

                lessonElement.appendChild(room);

                lessonElement.appendChild(weeks);


                // Добавляем карточку в день
                dayElement.appendChild(
                    lessonElement
                );

            }
        );


        // Добавляем день на страницу
        scheduleContainer.appendChild(
            dayElement
        );

    });

}


// ==========================================
// ОПРЕДЕЛЕНИЕ ТИПА ЗАНЯТИЯ
// ==========================================

function getLessonType(type) {

    const lessonType =
        Number(type);


    if (lessonType === 102) {
        return "Лекция";
    }


    if (lessonType === 103) {
        return "Практика";
    }


    return `Тип занятия: ${type}`;

}


// ==========================================
// ЗАПУСК
// ==========================================

loadSchedule();
