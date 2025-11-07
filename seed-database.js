import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

// Seed data
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create categories
    const categories = [
      { name: 'HTML Fundamentals', description: 'Learn the basics of HTML structure and tags', icon: '📄', color: 'bg-orange-100 text-orange-800' },
      { name: 'CSS Styling', description: 'Master CSS styling, layouts, and responsive design', icon: '🎨', color: 'bg-blue-100 text-blue-800' },
      { name: 'JavaScript Basics', description: 'Learn programming fundamentals with JavaScript', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
      { name: 'React & Next.js', description: 'Build modern web apps with React and Next.js', icon: '⚛️', color: 'bg-cyan-100 text-cyan-800' }
    ];

    for (const category of categories) {
      const categoryRef = doc(db, 'categories', category.name.toLowerCase().replace(/\s+/g, '-'));
      await setDoc(categoryRef, {
        ...category,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Created category: ${category.name}`);
    }

    // Create lessons
    const lessons = [
      {
        title: 'HTML Structure Basics',
        content: '# HTML Structure Basics\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages. In this lesson, you\'ll learn the fundamental structure of an HTML document.\n\n## Basic HTML Document Structure\n\nEvery HTML document has a basic structure that includes:\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Page Title</title>\n</head>\n<body>\n    <!-- Page content goes here -->\n</body>\n</html>\n```\n\n## Key Elements Explained\n\n### `<!DOCTYPE html>`\n- Declares the document type\n- Tells the browser this is an HTML5 document\n- Should be the very first line\n\n### `<html>` Element\n- Root element of the document\n- Contains all other elements\n- Language attribute should be set to "en"\n\n### `<head>` Section\n- Contains meta-information about the document\n- Includes title, styles, scripts\n- Content here is not visible on the page\n\n### `<body>` Section\n- Contains the visible content of the page\n- All visible content goes here\n- This is where your main content lives\n\n## Best Practices\n\n- Always use proper indentation\n- Include semantic HTML5 elements\n- Add appropriate meta tags\n- Ensure proper nesting of elements\n- Use lowercase for all tag names\n\nLet\'s start building your first HTML page!',
        description: 'Learn the fundamental structure of HTML documents',
        categoryId: 'html-fundamentals',
        order: 1,
        isPublished: true
      },
      {
        title: 'HTML Tags and Elements',
        content: '# HTML Tags and Elements\n\nHTML tags are the building blocks of web pages. In this lesson, you\'ll learn about the most commonly used HTML tags and how to use them properly.\n\n## What are HTML Tags?\n\nHTML tags are keywords surrounded by angle brackets `< >` that define different elements in a document. Most tags come in pairs: an opening tag and a closing tag.\n\n## Common HTML Tags\n\n### Headings\n```html\n<h1>Largest Heading</h1>\n<h2>Large Heading</h2>\n<h3>Medium Heading</h3>\n<h4>Small Heading</h4>\n<h5>Smaller Heading</h5>\n<h6>Smallest Heading</h6>\n```\n\n### Paragraphs\n```html\n<p>This is a paragraph of text.</p>\n```\n\n### Links\n```html\n<a href="https://example.com">This is a link</a>\n```\n\n### Images\n```html\n<img src="image.jpg" alt="Description of image">\n```\n\n### Lists\n```html\n<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>\n\n<ol>\n  <li>First item</li>\n  <li>Second item</li>\n</ol>\n```\n\n### Divisions\n```html\n<div>This is a division or section</div>\n```\n\n## Semantic HTML5 Tags\n\nHTML5 introduced semantic tags that give meaning to content:\n\n```html\n<header>Header content</header>\n<nav>Navigation</nav>\n<main>Main content</main>\n<aside>Sidebar content</aside>\n<footer>Footer content</footer>\n<section>Section content</section>\n<article>Article content</article>\n```\n\n## Best Practices\n\n- Use semantic tags when possible\n- Always include alt text for images\n- Use proper heading hierarchy (h1, h2, h3...)\n- Don\'t skip heading levels\n- Use meaningful link text\n- Validate your HTML\n\nStart practicing these tags to build solid HTML foundations!',
        description: 'Learn about essential HTML tags and semantic HTML5 elements',
        categoryId: 'html-fundamentals',
        order: 2,
        isPublished: true
      },
      {
        title: 'Forms and Input',
        content: '# HTML Forms and Input\n\nHTML forms allow users to input data and interact with web applications. This lesson covers form elements, validation, and submission.\n\n## Form Structure\n\nA basic HTML form has this structure:\n\n```html\n<form action="/submit-page" method="post">\n  <!-- Form elements go here -->\n</form>\n```\n\n## Common Input Types\n\n### Text Input\n```html\n<input type="text" name="username" placeholder="Enter username">\n```\n\n### Email Input\n```html\n<input type="email" name="email" placeholder="Enter email">\n```\n\n### Password Input\n```html\n<input type="password" name="password" placeholder="Enter password">\n```\n\n### Number Input\n```html\n<input type="number" name="age" min="1" max="120">\n```\n\n### Textarea\n```html\n<textarea name="message" placeholder="Enter your message"></textarea>\n```\n\n### Select Dropdown\n```html\n<select name="country">\n  <option value="us">United States</option>\n  <option value="ca">Canada</option>\n</select>\n```\n\n### Radio Buttons\n```html\n<input type="radio" name="gender" value="male"> Male\n<input type="radio" name="gender" value="female"> Female\n```\n\n### Checkboxes\n```html\n<input type="checkbox" name="newsletter" value="yes"> Subscribe to newsletter\n```\n\n### Submit Button\n```html\n<button type="submit">Submit Form</button>\n```\n\n## Form Attributes\n\n### Required Field\n```html\n<input type="text" name="email" required>\n```\n\n### Placeholder\n```html\n<input type="text" placeholder="Enter your name">\n```\n\n### Pattern\n```html\n<input type="text" pattern="[A-Za-z]{3,}" title="Three letters only">\n```\n\n## HTML5 Form Features\n\n### Date Input\n```html\n<input type="date" name="birthday">\n```\n\n### Color Picker\n```html\n<input type="color" name="theme">\n```\n\n### Range Slider\n```html\n<input type="range" name="volume" min="0" max="100">\n```\n\n## Best Practices\n\n- Always use `<label>` for form inputs\n- Include proper validation attributes\n- Use semantic form elements\n- Provide clear error messages\n- Ensure forms are accessible\n- Test forms thoroughly\n\nForms are essential for user interaction - master them to create dynamic web applications!',
        description: 'Master HTML forms, input validation, and user interaction',
        categoryId: 'html-fundamentals',
        order: 3,
        isPublished: true
      }
    ];

    for (const lesson of lessons) {
      const lessonRef = doc(db, 'lessons', lesson.title.toLowerCase().replace(/\s+/g, '-'));
      await setDoc(lessonRef, {
        ...lesson,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Created lesson: ${lesson.title}`);
    }

    // Create quizzes
    const quizzes = [
      {
        title: 'HTML Basics Quiz',
        description: 'Test your knowledge of fundamental HTML concepts',
        categoryId: 'html-fundamentals',
        difficulty: 'BEGINNER',
        timeLimit: 10,
        isPublished: true,
        questions: [
          {
            text: 'What does HTML stand for?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: [
              { text: 'Hyper Text Markup Language', isCorrect: true },
              { text: 'High Tech Modern Language', isCorrect: false },
              { text: 'Home Tool Markup Language', isCorrect: false },
              { text: 'Hyperlinks and Text Markup Language', isCorrect: false }
            ]
          },
          {
            text: 'Which tag is used for the largest heading?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: [
              { text: '<h1>', isCorrect: true },
              { text: '<h6>', isCorrect: false },
              { text: '<heading>', isCorrect: false },
              { text: '<header>', isCorrect: false }
            ]
          },
          {
            text: 'What is the correct way to create a link in HTML?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: [
              { text: '<a href="url">Link text</a>', isCorrect: true },
              { text: '<link>url</link>', isCorrect: false },
              { text: '<url>url</url>', isCorrect: false },
              { text: '<href>url</href>', isCorrect: false }
            ]
          },
          {
            text: 'Which HTML5 element is used for navigation?',
            type: 'MULTIPLE_CHOICE',
            order: 4,
            options: [
              { text: '<nav>', isCorrect: true },
              { text: '<navigation>', isCorrect: false },
              { text: '<menu>', isCorrect: false },
              { text: '<ul>', isCorrect: false }
            ]
          },
          {
            text: 'True or False: The <div> element is a block-level element.',
            type: 'TRUE_FALSE',
            order: 5,
            options: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'CSS Fundamentals Quiz',
        description: 'Test your understanding of CSS basics and styling',
        categoryId: 'css-styling',
        difficulty: 'BEGINNER',
        timeLimit: 15,
        isPublished: true,
        questions: [
          {
            text: 'What does CSS stand for?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: [
              { text: 'Computer Style Sheets', isCorrect: true },
              { text: 'Creative Style Sheets', isCorrect: false },
              { text: 'Cascading Style Sheets', isCorrect: false },
              { text: 'Colorful Style Sheets', isCorrect: false }
            ]
          },
          {
            text: 'Which property is used to change text color?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: [
              { text: 'text-color', isCorrect: true },
              { text: 'font-color', isCorrect: false },
              { text: 'color', isCorrect: false },
              { text: 'text-style', isCorrect: false }
            ]
          },
          {
            text: 'What is the CSS box model?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: [
              { text: 'Content, padding, border, margin', isCorrect: true },
              { text: 'Width, height, display, position', isCorrect: false },
              { text: 'Margin, border, padding, content', isCorrect: false },
              { text: 'Element, wrapper, container, box', isCorrect: false }
            ]
          }
        ]
      }
    ];

    for (const quiz of quizzes) {
      const quizRef = doc(db, 'quizzes', quiz.title.toLowerCase().replace(/\s+/g, '-'));
      const quizData = {
        ...quiz,
        createdAt: serverTimestamp()
      };
      
      await setDoc(quizRef, quizData);
      console.log(`✅ Created quiz: ${quiz.title}`);

      // Add questions to the quiz
      for (const question of quiz.questions) {
        const questionRef = doc(collection(quizRef, 'questions'), question.order.toString());
        const questionData = {
          ...question,
          createdAt: serverTimestamp()
        };
        
        await setDoc(questionRef, questionData);

        // Add options to the question
        for (const option of question.options) {
          const optionRef = doc(collection(questionRef, 'options'), option.text.substring(0, 10));
          await setDoc(optionRef, {
            ...option,
            createdAt: serverTimestamp()
          });
        }
      }
    }

    // Create achievements
    const achievements = [
      {
        title: 'Quiz Beginner',
        description: 'Complete your first quiz',
        icon: '🎯',
        xpReward: 50,
        condition: JSON.stringify({ type: 'quiz_completion', count: 1 })
      },
      {
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 100,
        condition: JSON.stringify({ type: 'streak', days: 7 })
      },
      {
        title: 'HTML Master',
        description: 'Complete all HTML lessons',
        icon: '📄',
        xpReward: 200,
        condition: JSON.stringify({ type: 'lesson_completion', category: 'html-fundamentals', count: 'all' })
      },
      {
        title: 'CSS Master',
        description: 'Complete all CSS lessons',
        icon: '🎨',
        xpReward: 200,
        condition: JSON.stringify({ type: 'lesson_completion', category: 'css-styling', count: 'all' })
      },
      {
        title: 'JavaScript Master',
        description: 'Complete all JavaScript lessons',
        icon: '⚡',
        xpReward: 300,
        condition: JSON.stringify({ type: 'lesson_completion', category: 'javascript-basics', count: 'all' })
      },
      {
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '⭐',
        xpReward: 150,
        condition: JSON.stringify({ type: 'quiz_perfect_score' })
      },
      {
        title: 'Speed Learner',
        description: 'Complete a quiz in under 2 minutes',
        icon: '⚡',
        xpReward: 75,
        condition: JSON.stringify({ type: 'quiz_speed', timeLimit: 120 })
      },
      {
        title: 'Knowledge Seeker',
        description: 'Complete 25 lessons',
        icon: '🎓',
        xpReward: 300,
        condition: JSON.stringify({ type: 'lesson_completion', count: 25 })
      }
    ];

    for (const achievement of achievements) {
      const achievementRef = doc(db, 'achievements', achievement.title.toLowerCase().replace(/\s+/g, '-'));
      await setDoc(achievementRef, {
        ...achievement,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Created achievement: ${achievement.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} categories created`);
    console.log(`   - ${lessons.length} lessons created`);
    console.log(`   - ${quizzes.length} quizzes created`);
    console.log(`   - ${achievements.length} achievements created`);
    console.log('');
    console.log('🚀 You can now start using the TrainMe platform!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();