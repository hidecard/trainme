import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA065XG19Wf6rp1eW5UOdBl4YCpnfMegc",
  authDomain: "messager-4abd8.firebaseapp.com",
  databaseURL: "https://messager-4abd8.firebaseio.com",
  projectId: "messager-4abd8",
  storageBucket: "messager-4abd8.appspot.com",
  messagingSenderId: "650985879545",
  appId: "1:650985879545:web:cd3edd8825090a3a40af28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setupFirebaseData() {
  console.log('🚀 Setting up Firebase data for TrainMe...');

  try {
    // Create categories
    const categories = [
      {
        name: 'HTML Fundamentals',
        description: 'Learn the basics of HTML including tags, attributes, and structure',
        icon: '📄',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        name: 'CSS Styling',
        description: 'Master CSS including flexbox, grid, animations, and responsive design',
        icon: '🎨',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        name: 'JavaScript Basics',
        description: 'Learn JavaScript programming from variables to DOM manipulation',
        icon: '⚡',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        name: 'React & Next.js',
        description: 'Build modern web applications with React and Next.js',
        icon: '⚛️',
        color: 'bg-cyan-100 text-cyan-800'
      }
    ];

    // Add categories to Firestore
    const categoriesBatch = writeBatch(db);
    categories.forEach((category) => {
      const categoryRef = doc(collection(db, 'categories'));
      categoriesBatch.set(categoryRef, {
        ...category,
        createdAt: serverTimestamp()
      });
    });
    await categoriesBatch.commit();
    console.log('✅ Categories created');

    // Create sample lessons
    const lessons = [
      {
        title: 'HTML Basics: Introduction to Tags',
        content: `# HTML Basics: Introduction to Tags

## What is HTML?

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure and content of a web page semantically.

## Basic HTML Tags

### 1. Headings
Headings are used to define titles and subtitles in your content.

\`\`\`html
<h1>Main Title</h1>
<h2>Subtitle</h2>
<h3>Section Title</h3>
\`\`\`

### 2. Paragraphs
The \`<p>\` tag defines a paragraph of text.

\`\`\`html
<p>This is a paragraph of text.</p>
\`\`\`

### 3. Links
The \`<a>\` tag creates hyperlinks to other pages.

\`\`\`html
<a href="https://example.com">This is a link</a>
\`\`\`

### 4. Lists
HTML provides ordered (\`<ol>\`) and unordered (\`<ul>\`) lists.

\`\`\`html
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
\`\`\`

## Practice Exercise

Try creating a simple HTML page with the tags you've learned!`,
        description: 'Learn the fundamental HTML tags and structure',
        categoryId: categories[0].name,
        order: 1,
        isPublished: true
      },
      {
        title: 'HTML Forms and Input',
        content: `# HTML Forms and Input

## Form Basics
HTML forms are used to collect user input.

\`\`\`html
<form>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name">
  <button type="submit">Submit</button>
</form>
\`\`\`

## Input Types
- Text inputs
- Password fields
- Checkboxes
- Radio buttons
- Dropdown selects`,
        description: 'Learn how to create interactive forms with various input types',
        categoryId: categories[0].name,
        order: 2,
        isPublished: true
      },
      {
        title: 'CSS Flexbox Fundamentals',
        content: `# CSS Flexbox Fundamentals

## What is Flexbox?

Flexbox is a one-dimensional layout method for arranging items in rows or columns.

## Basic Flexbox Properties

### 1. Container Properties
\`\`\`css
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

### 2. Item Properties
\`\`\`css
.item {
  flex: 1;
  margin: 10px;
}
\`\`\`

## Practice Exercise
Create a flexible navigation bar using flexbox!`,
        description: 'Master CSS flexbox for responsive layouts',
        categoryId: categories[1].name,
        order: 1,
        isPublished: true
      },
      {
        title: 'JavaScript Variables and Data Types',
        content: `# JavaScript Variables and Data Types

## Variables
Variables are containers for storing data values.

\`\`\`javascript
let name = "John";
const age = 25;
var city = "New York";
\`\`\`

## Data Types
JavaScript has several primitive data types:

### 1. String
\`\`\`javascript
let text = "Hello World";
\`\`\`

### 2. Number
\`\`\`javascript
let count = 42;
let price = 19.99;
\`\`\`

### 3. Boolean
\`\`\`javascript
let isStudent = true;
let hasLicense = false;
\`\`\`

## Practice Exercise
Create variables of different types and log them to the console!`,
        description: 'Understanding JavaScript fundamentals: variables and data types',
        categoryId: categories[2].name,
        order: 1,
        isPublished: true
      }
    ];

    // Add lessons to Firestore
    const lessonsBatch = writeBatch(db);
    lessons.forEach((lesson) => {
      const lessonRef = doc(collection(db, 'lessons'));
      lessonsBatch.set(lessonRef, {
        ...lesson,
        createdAt: serverTimestamp()
      });
    });
    await lessonsBatch.commit();
    console.log('✅ Lessons created');

    // Create sample quizzes
    const quizzes = [
      {
        title: 'HTML Basics Quiz',
        description: 'Test your knowledge of fundamental HTML tags and concepts',
        categoryId: categories[0].name,
        difficulty: 'BEGINNER',
        timeLimit: 10,
        isPublished: true,
        questions: [
          {
            text: 'What does HTML stand for?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: [
              { text: 'HyperText Markup Language', isCorrect: true },
              { text: 'High Tech Modern Language', isCorrect: false },
              { text: 'Home Tool Markup Language', isCorrect: false },
              { text: 'HyperText and Text Markup Language', isCorrect: false }
            ]
          },
          {
            text: 'Which HTML tag is used for the most important heading?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: [
              { text: '<h1>', isCorrect: true },
              { text: '<h6>', isCorrect: false },
              { text: '<header>', isCorrect: false },
              { text: '<title>', isCorrect: false }
            ]
          },
          {
            text: 'Which tag is used to create a hyperlink?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: [
              { text: '<link>', isCorrect: true },
              { text: '<a>', isCorrect: false },
              { text: '<href>', isCorrect: false },
              { text: '<url>', isCorrect: false }
            ]
          },
          {
            text: 'What is the correct way to create a paragraph in HTML?',
            type: 'MULTIPLE_CHOICE',
            order: 4,
            options: [
              { text: '<paragraph>', isCorrect: false },
              { text: '<p>', isCorrect: true },
              { text: '<text>', isCorrect: false },
              { text: '<para>', isCorrect: false }
            ]
          },
          {
            text: 'Which HTML tag is used for an unordered list?',
            type: 'MULTIPLE_CHOICE',
            order: 5,
            options: [
              { text: '<ul>', isCorrect: true },
              { text: '<ol>', isCorrect: false },
              { text: '<list>', isCorrect: false },
              { text: '<dl>', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'CSS Flexbox Quiz',
        description: 'Test your understanding of CSS flexbox concepts',
        categoryId: categories[1].name,
        difficulty: 'INTERMEDIATE',
        timeLimit: 15,
        isPublished: true,
        questions: [
          {
            text: 'Which property is used to make a flex container?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: [
              { text: 'display: flex', isCorrect: true },
              { text: 'display: block', isCorrect: false },
              { text: 'display: inline', isCorrect: false },
              { text: 'position: flex', isCorrect: false }
            ]
          },
          {
            text: 'What does flex-direction: column do?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: [
              { text: 'Arranges items vertically', isCorrect: true },
              { text: 'Arranges items horizontally', isCorrect: false },
              { text: 'Arranges items in a circle', isCorrect: false },
              { text: 'Arranges items diagonally', isCorrect: false }
            ]
          },
          {
            text: 'Which property is used to center items in a flex container?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: [
              { text: 'justify-content: center', isCorrect: true },
              { text: 'align-items: center', isCorrect: false },
              { text: 'text-align: center', isCorrect: false },
              { text: 'margin: 0 auto', isCorrect: false }
            ]
          }
        ]
      }
    ];

    // Add quizzes with questions to Firestore
    for (const quiz of quizzes) {
      const quizRef = doc(collection(db, 'quizzes'));
      const quizData = {
        ...quiz,
        createdAt: serverTimestamp()
      };

      await setDoc(quizRef, quizData);

      // Add questions for this quiz
      const questionsBatch = writeBatch(db);
      quiz.questions?.forEach((question, index) => {
        const questionRef = doc(collection(db, 'questions'));
        questionsBatch.set(questionRef, {
          ...question,
          quizId: quizRef.id,
          order: index + 1
        });

        // Add options for this question
        const optionsBatch = writeBatch(db);
        question.options.forEach((option) => {
          const optionRef = doc(collection(db, 'options'));
          optionsBatch.set(optionRef, {
            ...option,
            questionId: questionRef.id
          });
        });
        await optionsBatch.commit();
      });
      await questionsBatch.commit();
    }

    console.log('✅ Quizzes created');

    // Create achievements
    const achievements = [
      {
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👣',
        xpReward: 50,
        condition: JSON.stringify({ type: 'lesson_completion', count: 1 })
      },
      {
        title: 'Quiz Beginner',
        description: 'Complete your first quiz',
        icon: '🎯',
        xpReward: 100,
        condition: JSON.stringify({ type: 'quiz_completion', count: 1 })
      },
      {
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 200,
        condition: JSON.stringify({ type: 'streak', days: 7 })
      },
      {
        title: 'HTML Master',
        description: 'Complete all HTML lessons',
        icon: '📄',
        xpReward: 300,
        condition: JSON.stringify({ type: 'category_completion', category: 'HTML Fundamentals', count: 'all' })
      },
      {
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '⭐',
        xpReward: 150,
        condition: JSON.stringify({ type: 'quiz_perfect' })
      },
      {
        title: 'Speed Learner',
        description: 'Complete a quiz in under 2 minutes',
        icon: '⚡',
        xpReward: 75,
        condition: JSON.stringify({ type: 'quiz_speed', time: 120 })
      }
    ];

    // Add achievements to Firestore
    const achievementsBatch = writeBatch(db);
    achievements.forEach((achievement) => {
      const achievementRef = doc(collection(db, 'achievements'));
      achievementsBatch.set(achievementRef, {
        ...achievement,
        createdAt: serverTimestamp()
      });
    });
    await achievementsBatch.commit();
    console.log('✅ Achievements created');

    console.log('🎉 Firebase data setup completed successfully!');
    console.log('📊 Created:');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${lessons.length} lessons`);
    console.log(`   - ${quizzes.length} quizzes`);
    console.log(`   - ${achievements.length} achievements`);

  } catch (error) {
    console.error('❌ Error setting up Firebase data:', error);
  }
}

// Run the setup
setupFirebaseData().then(() => {
  console.log('✅ Setup complete! You can now start the application.');
}).catch((error) => {
  console.error('❌ Setup failed:', error);
});