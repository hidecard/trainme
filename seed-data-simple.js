import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA065XG19Wf6rp1eW5UOdBl4YCpnfMegc",
  authDomain: "messager-4abd8.firebaseapp.com",
  databaseURL: "https://messager-4abd8-default-rtdb.firebaseio.com",
  projectId: "messager-4abd8",
  storageBucket: "messager-4abd8.appspot.com",
  messagingSenderId: "650985879545",
  appId: "1:650985879545:web:cd3edd8825090a3a40af28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  console.log("Starting data seeding...");

  try {
    // Create categories
    const categories = [
      {
        name: "HTML Fundamentals",
        description: "Learn the basics of HTML including tags, attributes, and structure",
        icon: "📄",
        color: "bg-orange-100 text-orange-800"
      },
      {
        name: "CSS Styling",
        description: "Master CSS including flexbox, grid, animations, and responsive design",
        icon: "🎨",
        color: "bg-blue-100 text-blue-800"
      },
      {
        name: "JavaScript Basics",
        description: "Learn JavaScript fundamentals including variables, functions, and DOM manipulation",
        icon: "⚡",
        color: "bg-yellow-100 text-yellow-800"
      },
      {
        name: "React & Next.js",
        description: "Build modern web applications with React and Next.js",
        icon: "⚛️",
        color: "bg-cyan-100 text-cyan-800"
      }
    ];

    const categoryMap = {};
    for (const category of categories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp()
      });
      categoryMap[category.name] = docRef.id;
      console.log(`Created category: ${category.name}`);
    }

    // Create sample lessons
    const lessons = [
      {
        title: "HTML Introduction",
        content: "# HTML Introduction\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages.\n\n## Basic Structure\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n```\n\n## Common Tags\n- `<h1>` - Main heading\n- `<p>` - Paragraph\n- `<a>` - Links\n- `<img>` - Images\n- `<div>` - Container",
        description: "Introduction to HTML basics and structure",
        categoryId: categoryMap["HTML Fundamentals"],
        order: 1,
        isPublished: true
      },
      {
        title: "CSS Fundamentals",
        content: "# CSS Fundamentals\n\nCSS (Cascading Style Sheets) is used to style and layout web pages.\n\n## Basic Selectors\n```css\n/* Element selector */\np {\n    color: blue;\n}\n\n/* Class selector */\n.highlight {\n    background-color: yellow;\n}\n\n/* ID selector */\n#header {\n    font-size: 24px;\n}\n```\n\n## Box Model\n- Margin: Space outside element\n- Padding: Space inside element\n- Border: Line around element\n- Content: Actual content area",
        description: "Introduction to CSS styling and selectors",
        categoryId: categoryMap["CSS Styling"],
        order: 1,
        isPublished: true
      },
      {
        title: "JavaScript Variables and Data Types",
        content: "# JavaScript Variables\n\nJavaScript variables are containers for storing data values.\n\n## Declaring Variables\n```javascript\n// Using let\nlet name = 'John';\nlet age = 25;\n\n// Using const\nconst PI = 3.14159;\n\n// Using var (older way)\nvar city = 'New York';\n```\n\n## Data Types\n- **String**: Text in quotes: `'hello'`, `\"world\"`\n- **Number**: Integers and floats: `42`, `3.14`\n- **Boolean**: true/false values: `true`, `false`\n- **Array**: List of values: `[1, 2, 3]`\n- **Object**: Key-value pairs: `{name: 'John', age: 30}`\n- **Undefined**: Variable that hasn't been assigned\n- **Null**: Intentionally empty value",
        description: "Understanding JavaScript variables and data types",
        categoryId: categoryMap["JavaScript Basics"],
        order: 1,
        isPublished: true
      }
    ];

    for (const lesson of lessons) {
      await addDoc(collection(db, 'lessons'), {
        ...lesson,
        createdAt: serverTimestamp()
      });
      console.log(`Created lesson: ${lesson.title}`);
    }

    // Create sample quizzes
    const quizzes = [
      {
        title: "HTML Basics Quiz",
        description: "Test your knowledge of HTML fundamentals",
        categoryId: categoryMap["HTML Fundamentals"],
        difficulty: "BEGINNER",
        timeLimit: 10,
        isPublished: true,
        questions: [
          {
            text: "What is the correct HTML element for the largest heading?",
            type: "MULTIPLE_CHOICE",
            order: 1,
            options: [
              { text: "<h6>", isCorrect: false },
              { text: "<h1>", isCorrect: true },
              { text: "<heading>", isCorrect: false },
              { text: "<header>", isCorrect: false }
            ]
          },
          {
            text: "Which HTML attribute is used to define inline styles?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: [
              { text: "class", isCorrect: false },
              { text: "style", isCorrect: true },
              { text: "css", isCorrect: false },
              { text: "styles", isCorrect: false }
            ]
          },
          {
            text: "What does HTML stand for?",
            type: "MULTIPLE_CHOICE",
            order: 3,
            options: [
              { text: "HyperText Markup Language", isCorrect: true },
              { text: "High Tech Modern Language", isCorrect: false },
              { text: "Home Tool Markup Language", isCorrect: false },
              { text: "Hyperlinks and Text Markup Language", isCorrect: false }
            ]
          },
          {
            text: "Which HTML element is used to create a hyperlink?",
            type: "MULTIPLE_CHOICE",
            order: 4,
            options: [
              { text: "<link>", isCorrect: false },
              { text: "<a>", isCorrect: true },
              { text: "<url>", isCorrect: false },
              { text: "<href>", isCorrect: false }
            ]
          },
          {
            text: "HTML is case-sensitive. True or False?",
            type: "TRUE_FALSE",
            order: 5,
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "CSS Fundamentals Quiz",
        description: "Test your CSS knowledge and styling skills",
        categoryId: categoryMap["CSS Styling"],
        difficulty: "INTERMEDIATE",
        timeLimit: 15,
        isPublished: true,
        questions: [
          {
            text: "Which CSS property is used to change the text color?",
            type: "MULTIPLE_CHOICE",
            order: 1,
            options: [
              { text: "text-color", isCorrect: false },
              { text: "color", isCorrect: true },
              { text: "font-color", isCorrect: false },
              { text: "text-style", isCorrect: false }
            ]
          },
          {
            text: "What does CSS stand for?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: [
              { text: "Computer Style Sheets", isCorrect: true },
              { text: "Creative Style Sheets", isCorrect: false },
              { text: "Cascading Style Sheets", isCorrect: true },
              { text: "Colorful Style Sheets", isCorrect: false }
            ]
          }
        ]
      }
    ];

    for (const quiz of quizzes) {
      const quizDoc = await addDoc(collection(db, 'quizzes'), {
        title: quiz.title,
        description: quiz.description,
        categoryId: quiz.categoryId,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        isPublished: quiz.isPublished,
        createdAt: serverTimestamp()
      });

      // Add questions to the quiz
      for (const question of quiz.questions) {
        const questionDoc = await addDoc(collection(db, 'questions'), {
          quizId: quizDoc.id,
          text: question.text,
          type: question.type,
          order: question.order,
          createdAt: serverTimestamp()
        });

        // Add options for each question
        for (const option of question.options) {
          await addDoc(collection(db, 'options'), {
            questionId: quizDoc.id,
            text: option.text,
            isCorrect: option.isCorrect,
            createdAt: serverTimestamp()
          });
        }
      }
      console.log(`Created quiz: ${quiz.title}`);
    }

    // Create achievements
    const achievements = [
      {
        title: "First Quiz",
        description: "Complete your first quiz",
        icon: "🎯",
        xpReward: 50,
        condition: "{\"type\": \"quiz\", \"count\": 1}"
      },
      {
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "🔥",
        xpReward: 100,
        condition: "{\"type\": \"streak\", \"days\": 7}"
      },
      {
        title: "HTML Master",
        description: "Complete all HTML lessons",
        icon: "📄",
        xpReward: 200,
        condition: "{\"type\": \"lessons\", \"category\": \"HTML Fundamentals\", \"count\": \"all\"}"
      },
      {
        title: "Perfect Score",
        description: "Get 100% on any quiz",
        icon: "⭐",
        xpReward: 150,
        condition: "{\"type\": \"quiz\", \"score\": 100}"
      },
      {
        title: "Speed Learner",
        description: "Complete a quiz in under 2 minutes",
        icon: "⚡",
        xpReward: 75,
        condition: "{\"type\": \"quiz\", \"time\": 120}"
      },
      {
        title: "Knowledge Seeker",
        description: "Complete 25 lessons",
        icon: "🎓",
        xpReward: 300,
        condition: "{\"type\": \"lessons\", \"count\": 25}"
      }
    ];

    for (const achievement of achievements) {
      await addDoc(collection(db, 'achievements'), {
        ...achievement,
        createdAt: serverTimestamp()
      });
      console.log(`Created achievement: ${achievement.title}`);
    }

    console.log("✅ Data seeding completed successfully!");
    console.log("📊 Created:");
    console.log("- 4 Categories");
    console.log("- 3 Lessons");
    console.log("- 2 Quizzes with questions");
    console.log("- 6 Achievements");
    console.log("\n🎯 You can now test the platform with real Firebase data!");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

// Run the seeding function
seedData();