import { Question } from '../types';

export const ADDITIONAL_ROLE_QUESTIONS: Question[] = [
  // ==================== JAVA DEVELOPER ====================
  {
    id: 'java-mcq-1',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Java',
    skill: 'Java',
    difficulty: 'Easy',
    question: 'In Java, what is the default value of an uninitialized instance variable of type boolean?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'true', explanation: 'Incorrect: Default boolean is false.' },
      { key: 'B', text: 'false', explanation: 'Correct: Primitive boolean fields in a class default to false in Java.' },
      { key: 'C', text: 'null', explanation: 'Incorrect: Primitive types cannot be null; only wrapper Boolean objects can.' },
      { key: 'D', text: '0', explanation: 'Incorrect: In Java, boolean is not an integer type like in C.' },
    ],
  },
  {
    id: 'java-mcq-2',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'Which keyword prevents a Java method from being overridden by any subclass?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'static', explanation: 'Incorrect: Static methods can be hidden, but not polymorphically overridden.' },
      { key: 'B', text: 'abstract', explanation: 'Incorrect: Abstract methods MUST be implemented/overridden by subclasses.' },
      { key: 'C', text: 'final', explanation: 'Correct: Applying `final` to a method definition disallows overriding in derived classes.' },
      { key: 'D', text: 'volatile', explanation: 'Incorrect: `volatile` is for thread memory visibility of fields.' },
    ],
  },
  {
    id: 'java-mcq-3',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'How does Java 8+ HashMap handle bucket collision when a linked list exceeds TREEIFY_THRESHOLD (8 items)?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Converts the linked list into a balanced Red-Black Tree reducing search to O(log n).', explanation: 'Correct: To prevent worst-case O(n) hash collision attacks, Java 8 converts collision lists of 8+ nodes to Red-Black self-balancing trees.' },
      { key: 'B', text: 'Throws an unrecoverable HashCollisionException.', explanation: 'Incorrect: Collisions are standard and handled gracefully.' },
      { key: 'C', text: 'Drops earlier keys and keeps only the latest 8 keys.', explanation: 'Incorrect: HashMaps do not drop keys unless specifically an LRU eviction map.' },
      { key: 'D', text: 'Doubles the thread stack size.', explanation: 'Incorrect: Stack size is unrelated to heap hash table bucketing.' },
    ],
  },
  {
    id: 'java-mcq-4',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'In JDBC and JPA, why should prepared statements with parameterized queries always be preferred over string concatenation?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'Because string concatenation uses too much disk space.', explanation: 'Incorrect: The primary concern is security and plan caching.' },
      { key: 'B', text: 'Because prepared statements do not use database connections.', explanation: 'Incorrect: Prepared statements still run through standard JDBC connections.' },
      { key: 'C', text: 'Because parameterized queries force all columns to be VARCHAR.', explanation: 'Incorrect: Parameterized queries preserve strong database types.' },
      { key: 'D', text: 'Pre-compiles query plans and protects against SQL injection attacks.', explanation: 'Correct: Prepared statements separate SQL query code from user inputs, rendering SQL injection impossible while enabling query plan reuse.' },
    ],
  },
  {
    id: 'java-mcq-5',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Java',
    skill: 'Multithreading',
    difficulty: 'Hard',
    question: 'What is the purpose of the `volatile` keyword on a variable in Java?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Provides mutual exclusion atomic locking on compound increments like i++.', explanation: 'Incorrect: `volatile` does NOT make compound operations like i++ atomic; use AtomicInteger or synchronized for that.' },
      { key: 'B', text: 'Ensures changes made by one thread are immediately visible to all other threads via main memory.', explanation: 'Correct: `volatile` establishes a happens-before relationship, guaranteeing reads/writes bypass CPU caches and flush directly to main memory.' },
      { key: 'C', text: 'Prevents the garbage collector from reclaiming the variable.', explanation: 'Incorrect: Volatile variables are garbage collected normally.' },
      { key: 'D', text: 'Serializes the object to disk on application exit.', explanation: 'Incorrect: Serialization is governed by the `Serializable` interface.' },
    ],
  },
  {
    id: 'java-mcq-6',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Java',
    skill: 'Collections',
    difficulty: 'Easy',
    question: 'Which Java Collection does NOT allow duplicate elements?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'ArrayList', explanation: 'Incorrect: Lists maintain ordered duplicates.' },
      { key: 'B', text: 'LinkedList', explanation: 'Incorrect: LinkedList allows duplicates.' },
      { key: 'C', text: 'Set (e.g. HashSet, TreeSet)', explanation: 'Correct: The Set interface models the mathematical set abstraction and explicitly forbids duplicates.' },
      { key: 'D', text: 'Vector', explanation: 'Incorrect: Vector is a synchronized legacy list that permits duplicates.' },
    ],
  },
  {
    id: 'java-pseudo-1',
    role: 'Java Developer',
    type: 'PSEUDOCODE',
    topic: 'Java',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'What is the console output of the following Java code snippet?',
    pseudocode: `class Base {
    void show() { System.out.print("Base "); }
}
class Derived extends Base {
    void show() { System.out.print("Derived "); }
}
public class Test {
    public static void main(String[] args) {
        Base obj = new Derived();
        obj.show();
    }
}`,
    expectedOutput: 'Derived',
    explanation: 'Java uses runtime dynamic method dispatch (virtual methods by default). Since the actual object instantiated in the heap is `Derived`, its overridden `show()` method is invoked.',
  },
  {
    id: 'java-pseudo-2',
    role: 'Java Developer',
    type: 'PSEUDOCODE',
    topic: 'Java',
    skill: 'Control Flow',
    difficulty: 'Easy',
    question: 'Predict the output of the following loop:',
    pseudocode: `int sum = 0;
for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;
    sum += i;
}
System.out.println(sum);`,
    expectedOutput: '12',
    explanation: 'The loop executes for i = 1, 2, 4, 5 (skipping 3 via continue). 1 + 2 + 4 + 5 = 12.',
  },
  {
    id: 'java-code-1',
    role: 'Java Developer',
    type: 'CODING',
    topic: 'DSA',
    skill: 'Algorithms',
    difficulty: 'Easy',
    question: 'Palindrome Number: Given an integer x, return true if x is a palindrome, and false otherwise. Negative numbers are not palindromes.',
    constraints: '-2^31 <= x <= 2^31 - 1',
    codeTemplate: `public class Solution {
    public static boolean isPalindrome(int x) {
        if (x < 0) return false;
        int original = x, reversed = 0;
        while (x != 0) {
            int pop = x % 10;
            x /= 10;
            reversed = reversed * 10 + pop;
        }
        return original == reversed;
    }
}`,
    testCases: [
      { input: '121', expectedOutput: 'true' },
      { input: '-121', expectedOutput: 'false' },
      { input: '10', expectedOutput: 'false' },
    ],
    supportedLanguages: ['java', 'python', 'javascript', 'cpp', 'c'],
  },

  // ==================== WEB DEVELOPER ====================
  {
    id: 'web-mcq-1',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'JavaScript',
    skill: 'JavaScript',
    difficulty: 'Easy',
    question: 'What is the output of `typeof NaN` in JavaScript?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '"number"', explanation: 'Correct: In IEEE 754 and JavaScript ECMAScript specification, NaN (Not a Number) is a numeric data type representing an undefined or unrepresentable numerical value.' },
      { key: 'B', text: '"nan"', explanation: 'Incorrect: "nan" is not a recognized JavaScript primitive type.' },
      { key: 'C', text: '"undefined"', explanation: 'Incorrect: typeof undefined returns "undefined".' },
      { key: 'D', text: '"object"', explanation: 'Incorrect: typeof null is "object", but typeof NaN is "number".' },
    ],
  },
  {
    id: 'web-mcq-2',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'HTML/CSS',
    skill: 'CSS',
    difficulty: 'Medium',
    question: 'In the CSS Box Model, which property sets the spacing between the border and the content box?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'margin', explanation: 'Incorrect: Margin sets the spacing outside the border.' },
      { key: 'B', text: 'outline', explanation: 'Incorrect: Outline is drawn outside the border.' },
      { key: 'C', text: 'padding', explanation: 'Correct: Padding is the interior clearance space between the element content and its surrounding border.' },
      { key: 'D', text: 'gap', explanation: 'Incorrect: Gap sets spacing between grid/flex items.' },
    ],
  },
  {
    id: 'web-mcq-3',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'JavaScript',
    skill: 'Asynchronous JS',
    difficulty: 'Medium',
    question: 'In the JavaScript Event Loop, which queue takes priority and is completely drained before the next macrotask (e.g. setTimeout) runs?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Macrotask Task Queue', explanation: 'Incorrect: Macrotasks run after all pending microtasks are emptied.' },
      { key: 'B', text: 'Microtask Queue (Promises, queueMicrotask)', explanation: 'Correct: Microtasks (such as resolved Promise .then callbacks) have strict priority and the engine flushes the entire microtask queue before executing the next macrotask.' },
      { key: 'C', text: 'Garbage Collection Queue', explanation: 'Incorrect: GC runs non-deterministically managed by V8/browser.' },
      { key: 'D', text: 'Disk I/O Pool', explanation: 'Incorrect: I/O callbacks are macrotasks in the event loop.' },
    ],
  },
  {
    id: 'web-pseudo-1',
    role: 'Web Developer',
    type: 'PSEUDOCODE',
    topic: 'JavaScript',
    skill: 'Closures',
    difficulty: 'Medium',
    question: 'What is logged to the console when the following JavaScript code executes?',
    pseudocode: `function createCounter() {
    let count = 0;
    return function() {
        count += 2;
        return count;
    };
}
const counter = createCounter();
counter();
console.log(counter());`,
    expectedOutput: '4',
    explanation: 'The inner function forms a closure over `count`. First invocation: count becomes 0 + 2 = 2. Second invocation: count becomes 2 + 2 = 4. The logged value is 4.',
  },
  {
    id: 'web-code-1',
    role: 'Web Developer',
    type: 'CODING',
    topic: 'JavaScript',
    skill: 'Algorithms',
    difficulty: 'Easy',
    question: 'Chunk Array: Given an array `arr` and a chunk size `size`, return a chunked array of subarrays of length `size`. The final chunk may be shorter than `size`.',
    constraints: '0 <= arr.length <= 1000, 1 <= size <= 500',
    codeTemplate: `function chunk(arr, size) {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
        chunked.push(arr.slice(i, i + size));
    }
    return chunked;
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5], 1', expectedOutput: '[[1],[2],[3],[4],[5]]' },
      { input: '[1, 9, 6, 3, 2], 3', expectedOutput: '[[1,9,6],[3,2]]' },
      { input: '[], 1', expectedOutput: '[]' },
    ],
    supportedLanguages: ['javascript', 'python'],
  },

  // ==================== DATA SCIENTIST ====================
  {
    id: 'ds-mcq-1',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Statistics',
    skill: 'Statistics',
    difficulty: 'Medium',
    question: 'What is the Central Limit Theorem (CLT) fundamental principle in inferential statistics?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'The distribution of sample means approximates a normal distribution as sample size n grows large, regardless of population distribution shape.', explanation: 'Correct: The CLT proves that given sufficiently large samples (n >= 30), the sampling distribution of the mean is approximately normal even if the underlying population is non-normal.' },
      { key: 'B', text: 'All continuous random variables must have zero skewness.', explanation: 'Incorrect: Real-world populations frequently have heavy skewness.' },
      { key: 'C', text: 'The median and mode are always equal to the standard error.', explanation: 'Incorrect: Central tendency metrics do not equal variance measures.' },
      { key: 'D', text: 'Larger datasets always guarantee zero prediction bias.', explanation: 'Incorrect: CLT applies to sample distributions, not model bias.' },
    ],
  },
  {
    id: 'ds-mcq-2',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'ML Basics',
    skill: 'Supervised Learning',
    difficulty: 'Medium',
    question: 'In Decision Trees and Random Forests, what does Gini Impurity measure at a split node?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'The number of missing values in the feature column.', explanation: 'Incorrect: Missing values are handled before or through surrogate splits.' },
      { key: 'B', text: 'The compute latency of training the tree.', explanation: 'Incorrect: Impurity measures statistical purity, not hardware performance.' },
      { key: 'C', text: 'The probability of incorrectly classifying a randomly chosen element if it were randomly labeled according to the class distribution.', explanation: 'Correct: Gini impurity measures the homogeneity of a node: 0 represents complete purity (all elements belong to one class).' },
      { key: 'D', text: 'The correlation coefficient between target and predictor.', explanation: 'Incorrect: That is Pearson or Spearman r.' },
    ],
  },
  {
    id: 'ds-pseudo-1',
    role: 'Data Scientist',
    type: 'PSEUDOCODE',
    topic: 'Statistics',
    skill: 'Calculations',
    difficulty: 'Medium',
    question: 'Given the observations: [10, 20, 30, 40, 50]. What is the sample variance (using Bessel correction n-1)?',
    pseudocode: `DATA = [10, 20, 30, 40, 50]
Mean = 150 / 5 = 30
Differences from mean = [-20, -10, 0, 10, 20]
Squared differences = [400, 100, 0, 100, 400]
Sum of squares = 1000
Sample Variance = 1000 / (5 - 1)
PRINT Sample Variance`,
    expectedOutput: '250',
    explanation: 'Mean = 30. Squared deviations: 400 + 100 + 0 + 100 + 400 = 1000. Sample variance divides by n - 1 = 4: 1000 / 4 = 250.',
  },
  {
    id: 'ds-code-1',
    role: 'Data Scientist',
    type: 'CODING',
    topic: 'Statistics',
    skill: 'Algorithms',
    difficulty: 'Easy',
    question: 'Calculate Euclidean Distance: Given two coordinate points p1 and p2 represented as lists of numbers [x1, y1] and [x2, y2], return their Euclidean distance rounded to 2 decimal places.',
    constraints: 'Lists have length >= 2.',
    codeTemplate: `import math

def euclidean_distance(p1, p2):
    dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))
    return round(dist, 2)
`,
    testCases: [
      { input: '[0, 0], [3, 4]', expectedOutput: '5.0' },
      { input: '[1, 1], [4, 5]', expectedOutput: '5.0' },
      { input: '[1, 2], [1, 2]', expectedOutput: '0.0' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
];
