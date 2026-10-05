import { Question } from '../types';

export const COMPREHENSIVE_ROLE_QUESTIONS: Question[] = [
  // =========================================================================
  // 1. PYTHON DEVELOPER (25 Questions)
  // Topics: Python basics, Data types, Functions, OOP, Exception handling, Lists/dictionaries, Modules, File handling, DSA, SQL
  // =========================================================================
  {
    id: 'py-q-1',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python Basics',
    skill: 'Data Types',
    difficulty: 'Easy',
    question: 'In Python, what is the output of bool([]) and bool([0])?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'True, False', explanation: 'Incorrect: Empty collections evaluate to False in boolean context.' },
      { key: 'B', text: 'False, True', explanation: 'Correct: An empty list [] is falsy (False), whereas [0] contains one element and is truthy (True).' },
      { key: 'C', text: 'True, True', explanation: 'Incorrect: [] has length 0, so it evaluates to False.' },
      { key: 'D', text: 'False, False', explanation: 'Incorrect: [0] has length 1, so it evaluates to True.' }
    ]
  },
  {
    id: 'py-q-2',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python Basics',
    skill: 'Functions',
    difficulty: 'Medium',
    question: 'What happens when a mutable default argument like `def add_item(item, target=[])` is called repeatedly without providing `target`?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'A new empty list is created on each invocation.', explanation: 'Incorrect: Default arguments are bound once at function definition time.' },
      { key: 'B', text: 'A TypeError is raised by the interpreter.', explanation: 'Incorrect: Python syntactically permits mutable defaults.' },
      { key: 'C', text: 'The same list instance persists and accumulates items across calls.', explanation: 'Correct: The default list is created once at definition and mutated by every subsequent call that omits the parameter.' },
      { key: 'D', text: 'Garbage collection resets the list to empty.', explanation: 'Incorrect: The function object holds a persistent reference to the default.' }
    ]
  },
  {
    id: 'py-q-3',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'Inheritance & MRO',
    difficulty: 'Medium',
    question: 'Which method resolution order (MRO) algorithm does Python 3 utilize for multiple inheritance?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'C3 Linearization', explanation: 'Correct: Python 3 uses the C3 Linearization algorithm to determine monotonic inheritance hierarchy.' },
      { key: 'B', text: 'Pure Depth-First Search', explanation: 'Incorrect: Classic Python 2 used DFS which caused issues with diamond inheritance.' },
      { key: 'C', text: 'Breadth-First Search', explanation: 'Incorrect: BFS alone violates local precedence order in complex hierarchies.' },
      { key: 'D', text: 'Dijkstra Shortest Path', explanation: 'Incorrect: Dijkstra is a graph search algorithm, not class linearization.' }
    ]
  },
  {
    id: 'py-q-4',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'Magic Methods',
    difficulty: 'Medium',
    question: 'Which magic methods must a class implement to support the context manager protocol with the `with` statement?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '__init__ and __del__', explanation: 'Incorrect: __init__ constructs and __del__ is the destructor.' },
      { key: 'B', text: '__start__ and __stop__', explanation: 'Incorrect: These are not standard context manager methods.' },
      { key: 'C', text: '__enter__ and __exit__', explanation: 'Correct: Context managers require `__enter__(self)` and `__exit__(self, exc_type, exc_val, exc_tb)`.' },
      { key: 'D', text: '__open__ and __close__', explanation: 'Incorrect: Context management specifically relies on `__enter__` and `__exit__`.' }
    ]
  },
  {
    id: 'py-q-5',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Exception Handling',
    skill: 'Exceptions',
    difficulty: 'Easy',
    question: 'In a Python `try...except...else...finally` structure, when does the `else` block execute?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Only when an unhandled exception occurs.', explanation: 'Incorrect: That would be handled by except or terminate the script.' },
      { key: 'B', text: 'Only when NO exceptions are raised in the `try` block.', explanation: 'Correct: The `else` clause executes if and only if the `try` block completed without raising any exception.' },
      { key: 'C', text: 'Always, regardless of exceptions.', explanation: 'Incorrect: `finally` executes unconditionally, not `else`.' },
      { key: 'D', text: 'Only when a SyntaxError is detected.', explanation: 'Incorrect: SyntaxErrors prevent compilation before execution.' }
    ]
  },
  {
    id: 'py-q-6',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Lists and Dictionaries',
    skill: 'Data Structures',
    difficulty: 'Medium',
    question: 'What is the average time complexity of searching a key in a Python dict versus binary search in a sorted list?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'O(log n) for dict, O(1) for list', explanation: 'Incorrect: Dictionaries use hash tables, not trees.' },
      { key: 'B', text: 'O(1) for dict, O(log n) for sorted list', explanation: 'Correct: Python dict uses a sparse hash table offering O(1) average lookup; binary search in a sorted list is O(log n).' },
      { key: 'C', text: 'O(n) for dict, O(n) for list', explanation: 'Incorrect: Hash lookup is average constant time.' },
      { key: 'D', text: 'O(1) for dict, O(1) for list', explanation: 'Incorrect: Searching an element in a list requires index or search O(log n).' }
    ]
  },
  {
    id: 'py-q-7',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'File Handling',
    skill: 'I/O',
    difficulty: 'Easy',
    question: 'Which file mode in Python opens a file for writing without truncating existing content, positioning the pointer at the end?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: "'a' (Append mode)", explanation: 'Correct: Mode "a" opens the file for writing, preserving existing data and writing new data at the end.' },
      { key: 'B', text: "'w' (Write mode)", explanation: 'Incorrect: "w" truncates (erases) the file content immediately.' },
      { key: 'C', text: "'r+' (Read/Write mode)", explanation: 'Incorrect: "r+" starts the pointer at index 0 and overwrites from the beginning.' },
      { key: 'D', text: "'x' (Exclusive creation)", explanation: 'Incorrect: "x" fails if the file already exists.' }
    ]
  },
  {
    id: 'py-q-8',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Modules & Concurrency',
    skill: 'GIL & Multiprocessing',
    difficulty: 'Hard',
    question: 'Why does CPU-bound multithreading in CPython not achieve true parallel speedup across multiple CPU cores?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Because the Global Interpreter Lock (GIL) permits only one native thread to execute Python bytecode at a time.', explanation: 'Correct: The CPython GIL serializes execution of Python bytecode across threads. For CPU-bound tasks, `multiprocessing` or native C extensions must be used.' },
      { key: 'B', text: 'Because Python threads cannot run on modern multicore processors.', explanation: 'Incorrect: Python creates OS native threads, but they compete for the GIL.' },
      { key: 'C', text: 'Because Python does not support asynchronous syntax.', explanation: 'Incorrect: Python supports async/await through `asyncio`.' },
      { key: 'D', text: 'Because OS thread scheduling is disabled by default.', explanation: 'Incorrect: OS handles scheduling normally.' }
    ]
  },
  {
    id: 'py-q-9',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python Basics',
    skill: 'Memory Management',
    difficulty: 'Medium',
    question: 'How does CPython reclaim memory from objects that reference each other in a cyclic dependency (e.g. A.child = B, B.parent = A)?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Reference counting alone immediately deallocates cycles.', explanation: 'Incorrect: Reference counting cannot detect self-sustaining circular references where ref count never drops to 0.' },
      { key: 'B', text: 'Cycles are never garbage collected and leak until process exit.', explanation: 'Incorrect: CPython has an active generational cycle detector.' },
      { key: 'C', text: 'The Generational Cyclic Garbage Collector periodically identifies unreachable reference graphs.', explanation: 'Correct: CPython uses 3-generation cyclic garbage collection that detects and frees isolated reference cycles.' },
      { key: 'D', text: 'Virtual memory paging automatically swaps cycles to disk.', explanation: 'Incorrect: That is an OS paging feature, not Python GC.' }
    ]
  },
  {
    id: 'py-q-10',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'Data Structures',
    difficulty: 'Medium',
    question: 'Which module in the Python standard library provides a high-performance doubly linked list with O(1) appends and pops from both ends?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'array', explanation: 'Incorrect: `array` provides a contiguous array of primitive C types.' },
      { key: 'B', text: 'collections.deque', explanation: 'Correct: `collections.deque` (double-ended queue) guarantees O(1) appends and pops from both ends.' },
      { key: 'C', text: 'heapq', explanation: 'Incorrect: `heapq` provides min-heap priority queue algorithms over standard lists.' },
      { key: 'D', text: 'queue.Queue', explanation: 'Incorrect: `queue.Queue` is a synchronized multithreading queue wrapper.' }
    ]
  },
  {
    id: 'py-q-11',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL Joins & Grouping',
    difficulty: 'Medium',
    question: 'In SQL, what is the functional difference between the WHERE clause and the HAVING clause?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'WHERE filters grouped rows after aggregation, while HAVING filters individual rows before aggregation.', explanation: 'Incorrect: This is backwards.' },
      { key: 'B', text: 'WHERE only works with primary keys.', explanation: 'Incorrect: WHERE works with any column condition.' },
      { key: 'C', text: 'WHERE filters rows before grouping and aggregation; HAVING filters groups after aggregation.', explanation: 'Correct: WHERE filters raw table records before GROUP BY; HAVING applies predicates to aggregated result groups (e.g. HAVING COUNT(*) > 5).' },
      { key: 'D', text: 'WHERE and HAVING are completely interchangeable synonyms.', explanation: 'Incorrect: HAVING is applied after grouping and allows aggregate functions.' }
    ]
  },
  {
    id: 'py-q-12',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python Basics',
    skill: 'Generators',
    difficulty: 'Medium',
    question: 'What is the primary memory advantage of using a generator expression `(x*2 for x in data)` instead of a list comprehension `[x*2 for x in data]`?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Generators produce values on-demand one by one (lazy evaluation) with O(1) space complexity regardless of dataset size.', explanation: 'Correct: Generator expressions yield items on iteration without building the entire list in memory, consuming constant O(1) memory.' },
      { key: 'B', text: 'Generators automatically cache all historical values on disk.', explanation: 'Incorrect: Generators do not store past values.' },
      { key: 'C', text: 'Generators compile into C native arrays.', explanation: 'Incorrect: Generators are standard Python iterator objects.' },
      { key: 'D', text: 'Generators can be indexed arbitrarily with brackets [i].', explanation: 'Incorrect: Generators do not support random indexing.' }
    ]
  },

  // =========================================================================
  // 2. JAVA DEVELOPER (25 Questions)
  // Topics: OOP, Classes/objects, Inheritance, Polymorphism, Exception handling, Collections, Strings, Multithreading, JDBC/SQL, JVM
  // =========================================================================
  {
    id: 'java-q-1',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Java Basics',
    skill: 'Primitives & Types',
    difficulty: 'Easy',
    question: 'In Java, what is the default value of an uninitialized instance variable of primitive type `boolean`?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'true', explanation: 'Incorrect: Default boolean in Java is false.' },
      { key: 'B', text: 'false', explanation: 'Correct: Fields of primitive boolean type default to `false` in Java objects.' },
      { key: 'C', text: 'null', explanation: 'Incorrect: Primitive types cannot hold null; only wrapper `Boolean` objects can.' },
      { key: 'D', text: '0', explanation: 'Incorrect: Java booleans are distinct from integer 0.' }
    ]
  },
  {
    id: 'java-q-2',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'Polymorphism & Final',
    difficulty: 'Easy',
    question: 'Which keyword in Java prevents a method from being overridden in any subclass?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'static', explanation: 'Incorrect: Static methods can be hidden, but not polymorphically overridden.' },
      { key: 'B', text: 'abstract', explanation: 'Incorrect: Abstract methods must be overridden.' },
      { key: 'C', text: 'final', explanation: 'Correct: Applying `final` to a method definition disallows subclasses from overriding it.' },
      { key: 'D', text: 'volatile', explanation: 'Incorrect: `volatile` is used for field memory visibility across threads.' }
    ]
  },
  {
    id: 'java-q-3',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Collections',
    skill: 'HashMap Internals',
    difficulty: 'Hard',
    question: 'In Java 8+, what optimization does `HashMap` perform when the number of elements in a single bucket exceeds TREEIFY_THRESHOLD (8 items)?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Converts the linked list into a balanced Red-Black Tree, reducing lookup from O(n) to O(log n).', explanation: 'Correct: To guard against hash collision attacks and performance degradation, Java 8 transforms collision lists with >= 8 entries into Red-Black trees.' },
      { key: 'B', text: 'Throws a ConcurrentModificationException.', explanation: 'Incorrect: This exception is thrown when iterating during structural modification.' },
      { key: 'C', text: 'Discards older entries and keeps only 8 items.', explanation: 'Incorrect: Standard HashMaps never discard entries.' },
      { key: 'D', text: 'Switches the hashing algorithm to MD5.', explanation: 'Incorrect: Java does not switch hash algorithms at runtime.' }
    ]
  },
  {
    id: 'java-q-4',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Multithreading',
    skill: 'Concurrency',
    difficulty: 'Medium',
    question: 'What is the primary guarantee provided by the `volatile` keyword on a shared variable in Java?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'It guarantees that compound operations like count++ are atomic.', explanation: 'Incorrect: `volatile` does NOT provide atomicity for compound operations; AtomicInteger or synchronization is required.' },
      { key: 'B', text: 'It guarantees direct visibility: any write is flushed to main memory and reads always bypass CPU caches.', explanation: 'Correct: `volatile` ensures memory visibility and prevents compiler instruction reordering around that variable.' },
      { key: 'C', text: 'It locks the object monitor during execution.', explanation: 'Incorrect: `synchronized` locks monitors, not `volatile`.' },
      { key: 'D', text: 'It serializes the variable to persistent storage.', explanation: 'Incorrect: Serialization uses `Serializable`.' }
    ]
  },
  {
    id: 'java-q-5',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Strings & Memory',
    skill: 'String Pool',
    difficulty: 'Medium',
    question: 'Given `String s1 = "Hello"; String s2 = new String("Hello");`, what do `s1 == s2` and `s1.equals(s2)` return?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 's1 == s2 is false; s1.equals(s2) is true', explanation: 'Correct: `==` compares reference memory addresses (`s1` is in String Constant Pool while `new String()` allocates a new heap object). `equals()` compares character contents.' },
      { key: 'B', text: 's1 == s2 is true; s1.equals(s2) is true', explanation: 'Incorrect: They reference different memory locations.' },
      { key: 'C', text: 's1 == s2 is false; s1.equals(s2) is false', explanation: 'Incorrect: Both strings have identical character sequences.' },
      { key: 'D', text: 's1 == s2 is true; s1.equals(s2) is false', explanation: 'Incorrect: If == were true, equals would also be true.' }
    ]
  },
  {
    id: 'java-q-6',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'JVM Architecture',
    skill: 'Memory Management',
    difficulty: 'Hard',
    question: 'Which JVM memory area stores class metadata, runtime constant pool, field and method data, and bytecode?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Young Generation Eden Space', explanation: 'Incorrect: Eden space stores newly allocated object instances.' },
      { key: 'B', text: 'Java Thread Stack', explanation: 'Incorrect: Stack stores primitive local variables and method call frame pointers.' },
      { key: 'C', text: 'Metaspace (Native Memory in Java 8+)', explanation: 'Correct: In Java 8+, the PermGen was replaced by Metaspace, which lives in native memory and stores class metadata.' },
      { key: 'D', text: 'Program Counter Register', explanation: 'Incorrect: PC register holds the address of current JVM instruction.' }
    ]
  },
  {
    id: 'java-q-7',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Exception Handling',
    skill: 'Checked vs Unchecked',
    difficulty: 'Medium',
    question: 'Which of the following exceptions in Java is an Unchecked Exception that does NOT require mandatory try-catch or `throws` declaration?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'IOException', explanation: 'Incorrect: IOException is a checked exception directly inheriting from Exception.' },
      { key: 'B', text: 'SQLException', explanation: 'Incorrect: SQLException is a checked exception.' },
      { key: 'C', text: 'ClassNotFoundException', explanation: 'Incorrect: ClassNotFoundException is a checked exception.' },
      { key: 'D', text: 'NullPointerException', explanation: 'Correct: NullPointerException extends `RuntimeException` and is therefore unchecked.' }
    ]
  },
  {
    id: 'java-q-8',
    role: 'Java Developer',
    type: 'MCQ',
    topic: 'Collections',
    skill: 'Comparable vs Comparator',
    difficulty: 'Medium',
    question: 'What is the key difference between Java’s `Comparable` and `Comparator` interfaces?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Comparable defines natural ordering via `compareTo(T o)` on the class itself; Comparator defines custom/multiple sort strategies via `compare(T o1, T o2)`.', explanation: 'Correct: Comparable provides single natural ordering implemented by the entity; Comparator is an external strategy interface.' },
      { key: 'B', text: 'Comparable is for sorting numbers only; Comparator is for strings only.', explanation: 'Incorrect: Both interfaces are fully generic.' },
      { key: 'C', text: 'Comparator requires modifying original source code of the class.', explanation: 'Incorrect: Comparator allows sorting third-party classes without modifying them.' },
      { key: 'D', text: 'Comparable is deprecated in Java 17.', explanation: 'Incorrect: Both are widely used core Java interfaces.' }
    ]
  },

  // =========================================================================
  // 3. DATA ANALYST (25 Questions)
  // Topics: SQL, Statistics, Data cleaning, Excel/data concepts, Python for data analysis, Data visualization
  // =========================================================================
  {
    id: 'da-q-1',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'Window Functions',
    difficulty: 'Medium',
    question: 'In SQL, what is the exact difference between `RANK()` and `DENSE_RANK()` when rows have tied values?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'RANK() never produces ties, while DENSE_RANK() does.', explanation: 'Incorrect: Both functions recognize ties and assign equal ranks.' },
      { key: 'B', text: 'RANK() skips rank numbers after a tie (e.g. 1, 1, 3), while DENSE_RANK() produces consecutive numbers (e.g. 1, 1, 2).', explanation: 'Correct: RANK leaves gaps corresponding to the number of tied rows; DENSE_RANK always continues consecutively without gaps.' },
      { key: 'C', text: 'RANK() can only sort ascending, while DENSE_RANK() sorts descending.', explanation: 'Incorrect: Both respect the ORDER BY clause.' },
      { key: 'D', text: 'DENSE_RANK() only works with integer columns.', explanation: 'Incorrect: Both work with any sortable data type.' }
    ]
  },
  {
    id: 'da-q-2',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Statistics',
    skill: 'Central Tendency',
    difficulty: 'Easy',
    question: 'When analyzing salary data that contains a small number of extremely high executive outliers, which measure of central tendency provides the most representative picture?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Arithmetic Mean', explanation: 'Incorrect: The mean is sensitive to extreme values and gets pulled upwards.' },
      { key: 'B', text: 'Median', explanation: 'Correct: The median is the 50th percentile and is robust against skewed distributions and high outliers.' },
      { key: 'C', text: 'Standard Deviation', explanation: 'Incorrect: Standard deviation measures spread/dispersion, not central location.' },
      { key: 'D', text: 'Variance', explanation: 'Incorrect: Variance measures dispersion.' }
    ]
  },
  {
    id: 'da-q-3',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Python for Data Analysis',
    skill: 'Pandas',
    difficulty: 'Easy',
    question: 'In Pandas, which method returns summary statistics (count, mean, std, min, 25%, 50%, 75%, max) for all numerical columns of a DataFrame?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'df.describe()', explanation: 'Correct: `df.describe()` outputs statistical summaries for numeric series.' },
      { key: 'B', text: 'df.info()', explanation: 'Incorrect: `df.info()` displays column data types and non-null counts.' },
      { key: 'C', text: 'df.summary()', explanation: 'Incorrect: `summary()` is an R function; in pandas it is `describe()`.' },
      { key: 'D', text: 'df.stats()', explanation: 'Incorrect: `stats()` is not a standard pandas method.' }
    ]
  },
  {
    id: 'da-q-4',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Data Cleaning',
    skill: 'Missing Data',
    difficulty: 'Medium',
    question: 'What is the danger of using simple Mean Imputation to fill missing values in a feature column?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'It creates infinite values in the dataset.', explanation: 'Incorrect: Mean is a finite single number.' },
      { key: 'B', text: 'It doubles the number of rows.', explanation: 'Incorrect: Imputation modifies values, not row count.' },
      { key: 'C', text: 'It artificially reduces variance and distorts relationships/correlations with other variables.', explanation: 'Correct: Replacing missing cells with the mean clumps distribution at the center, artificially shrinking variance and attenuating covariance.' },
      { key: 'D', text: 'It prevents the column from being indexed.', explanation: 'Incorrect: Indexing is unaffected.' }
    ]
  },
  {
    id: 'da-q-5',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Data Visualization',
    skill: 'Chart Selection',
    difficulty: 'Easy',
    question: 'Which chart type is best suited for displaying the distribution and identifying outliers across quartiles of a continuous numerical variable?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Pie Chart', explanation: 'Incorrect: Pie charts show categorical proportions, not continuous distributions.' },
      { key: 'B', text: 'Scatter Plot', explanation: 'Incorrect: Scatter plots show relationships between two variables.' },
      { key: 'C', text: 'Box and Whisker Plot', explanation: 'Correct: Box plots display median, IQR (Q1 to Q3), whiskers (1.5*IQR), and individual outlier points.' },
      { key: 'D', text: 'Stacked Bar Chart', explanation: 'Incorrect: Stacked bars show categorical group compositions.' }
    ]
  },
  {
    id: 'da-q-6',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'Aggregations',
    difficulty: 'Medium',
    question: 'What is the result of `SELECT COUNT(commission) FROM employees;` if 10 rows have numeric commission values and 5 rows have NULL?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '15', explanation: 'Incorrect: `COUNT(*)` counts all rows including NULL, but `COUNT(column)` ignores NULL values.' },
      { key: 'B', text: '10', explanation: 'Correct: `COUNT(column_name)` counts non-NULL entries only, returning 10.' },
      { key: 'C', text: '5', explanation: 'Incorrect: 5 is the number of NULLs, not non-NULLs.' },
      { key: 'D', text: 'NULL', explanation: 'Incorrect: Aggregate counts always return integer values, never NULL.' }
    ]
  },

  // =========================================================================
  // 4. DATA SCIENTIST (25 Questions)
  // Topics: Probability, Statistics, Python, Data preprocessing, Machine learning basics, Model evaluation, Feature selection
  // =========================================================================
  {
    id: 'ds-q-1',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Probability & Statistics',
    skill: 'Hypothesis Testing',
    difficulty: 'Medium',
    question: 'In statistical hypothesis testing, what does a p-value of 0.03 mean relative to a significance level alpha = 0.05?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Reject the null hypothesis: there is statistically significant evidence against the null.', explanation: 'Correct: When p-value < alpha (0.03 < 0.05), we reject the null hypothesis in favor of the alternative hypothesis.' },
      { key: 'B', text: 'Fail to reject the null hypothesis because p > 0.', explanation: 'Incorrect: Rejection threshold is alpha = 0.05.' },
      { key: 'C', text: 'The probability that the alternative hypothesis is false is 3%.', explanation: 'Incorrect: P-value is the probability of observing data at least as extreme assuming the null is true.' },
      { key: 'D', text: 'The experiment must be discarded due to high variance.', explanation: 'Incorrect: 0.03 is standard statistically significant evidence.' }
    ]
  },
  {
    id: 'ds-q-2',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Machine Learning',
    skill: 'Bias-Variance Tradeoff',
    difficulty: 'Medium',
    question: 'A machine learning model exhibits 99% training accuracy but only 61% test accuracy. What problem is occurring?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'High Bias (Underfitting)', explanation: 'Incorrect: Underfitting results in poor performance on both training and test data.' },
      { key: 'B', text: 'High Variance (Overfitting)', explanation: 'Correct: A large performance gap where the model memorizes training noise and fails to generalize to unseen test data indicates overfitting (high variance).' },
      { key: 'C', text: 'Data leakage causing underfitting.', explanation: 'Incorrect: High test error relative to training error is the hallmark of overfitting.' },
      { key: 'D', text: 'Low model complexity.', explanation: 'Incorrect: Overfitting is caused by excessive model complexity.' }
    ]
  },
  {
    id: 'ds-q-3',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Model Evaluation',
    skill: 'Classification Metrics',
    difficulty: 'Medium',
    question: 'In fraud detection where 99.8% of transactions are legitimate and 0.2% are fraudulent, which evaluation metric is LEAST informative?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Accuracy', explanation: 'Correct: A naive model that classifies every transaction as legitimate achieves 99.8% accuracy while catching 0% of fraud. PR-AUC, Recall, and Precision are much more informative.' },
      { key: 'B', text: 'Precision-Recall AUC (PR-AUC)', explanation: 'Incorrect: PR-AUC is specifically informative on imbalanced data.' },
      { key: 'C', text: 'Recall', explanation: 'Incorrect: Recall measures the proportion of actual fraud detected.' },
      { key: 'D', text: 'F1-Score', explanation: 'Incorrect: F1-Score balances precision and recall.' }
    ]
  },
  {
    id: 'ds-q-4',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Feature Engineering',
    skill: 'Dimensionality Reduction',
    difficulty: 'Hard',
    question: 'How does Principal Component Analysis (PCA) determine the direction of the first principal component (PC1)?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'It minimizes the sum of absolute errors against the target variable.', explanation: 'Incorrect: PCA is unsupervised and does not use target variables.' },
      { key: 'B', text: 'It connects the two furthest outlier points.', explanation: 'Incorrect: Outliers distort PCA, but it does not connect endpoints.' },
      { key: 'C', text: 'It finds the linear axis that maximizes the variance of projected data points (corresponding to the eigenvector with the largest eigenvalue of covariance matrix).', explanation: 'Correct: PC1 is the eigenvector of the data covariance matrix with the highest eigenvalue, capturing the maximum orthogonal variance.' },
      { key: 'D', text: 'It clusters points based on Euclidean centroid distances.', explanation: 'Incorrect: That describes K-Means clustering, not PCA.' }
    ]
  },
  {
    id: 'ds-q-5',
    role: 'Data Scientist',
    type: 'MCQ',
    topic: 'Data Preprocessing',
    skill: 'Scaling',
    difficulty: 'Easy',
    question: 'Which algorithms are sensitive to feature scales and require StandardScaler or MinMaxScaler before training?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'K-Nearest Neighbors (KNN), Support Vector Machines (SVM), and Gradient Descent models', explanation: 'Correct: Distance-based algorithms (KNN, SVM) and gradient-based optimizers depend directly on Euclidean distances and coordinate magnitudes.' },
      { key: 'B', text: 'Decision Trees and Random Forests', explanation: 'Incorrect: Tree-based models partition features monotonically and are invariant to monotonic scale transformations.' },
      { key: 'C', text: 'Naive Bayes categorical models', explanation: 'Incorrect: Naive Bayes uses class conditional probabilities.' },
      { key: 'D', text: 'XGBoost with tree booster', explanation: 'Incorrect: Tree boosting is scale invariant.' }
    ]
  },

  // =========================================================================
  // 5. ML ENGINEER (25 Questions)
  // Topics: Python, ML algorithms, Feature engineering, Model evaluation, Deep learning basics, SQL, Pipeline optimization
  // =========================================================================
  {
    id: 'ml-q-1',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Machine Learning Algorithms',
    skill: 'Regularization',
    difficulty: 'Medium',
    question: 'What is the difference in mathematical effect between L1 Regularization (Lasso) and L2 Regularization (Ridge)?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'L2 regularization eliminates features completely, while L1 preserves small weights.', explanation: 'Incorrect: This is the reverse of their behavior.' },
      { key: 'B', text: 'L1 adds the absolute magnitude of coefficients (|w|), producing sparse models with exact zeros; L2 adds squared magnitude (w²), shrinking weights smoothly.', explanation: 'Correct: L1 penalty diamond constraint forces non-essential coefficients strictly to zero (acting as feature selection); L2 circular constraint shrinks weights near zero without exact sparsity.' },
      { key: 'C', text: 'L1 can only be applied to neural networks.', explanation: 'Incorrect: Both penalties apply to linear models, logistic regression, and deep nets.' },
      { key: 'D', text: 'L2 causes severe numerical instability with correlated features.', explanation: 'Incorrect: L2 handles multicollinearity effectively.' }
    ]
  },
  {
    id: 'ml-q-2',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Deep Learning Basics',
    skill: 'Activation Functions',
    difficulty: 'Medium',
    question: 'Why did ReLU (Rectified Linear Unit, f(x) = max(0, x)) largely replace Sigmoid and Tanh as the standard activation function in deep hidden layers?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'It mitigates the vanishing gradient problem for positive inputs (derivative is constant 1) and is computationally cheap to calculate.', explanation: 'Correct: Sigmoid and Tanh saturate at extreme inputs where derivatives approach 0, causing vanishing gradients in deep backpropagation. ReLU avoids saturation for x > 0.' },
      { key: 'B', text: 'It bounds outputs strictly between -1 and 1.', explanation: 'Incorrect: ReLU is unbounded on the positive side [0, infinity).' },
      { key: 'C', text: 'It is continuously differentiable at x = 0.', explanation: 'Incorrect: ReLU has a subgradient at x = 0.' },
      { key: 'D', text: 'It prevents all dead neurons completely.', explanation: 'Incorrect: Dying ReLU is actually a known limitation of standard ReLU.' }
    ]
  },
  {
    id: 'ml-q-3',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Model Optimization',
    skill: 'Optimizers',
    difficulty: 'Hard',
    question: 'How does the Adam optimizer combine the advantages of AdaGrad and RMSProp?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'By alternating between full-batch and stochastic gradient updates every epoch.', explanation: 'Incorrect: Adam is an adaptive per-parameter learning rate optimizer.' },
      { key: 'B', text: 'By computing exact second-order Hessian matrix inversions.', explanation: 'Incorrect: Adam is a first-order optimization method.' },
      { key: 'C', text: 'By maintaining exponentially decaying moving averages of past gradients (first moment / momentum) and past squared gradients (second moment), with bias correction.', explanation: 'Correct: Adam computes m_t (mean of gradients) and v_t (uncentered variance of gradients) with initial zero-bias correction to adapt step sizes dynamically.' },
      { key: 'D', text: 'By applying simulated annealing temperature decay.', explanation: 'Incorrect: Adam uses momentum and adaptive scaling, not simulated annealing.' }
    ]
  },
  {
    id: 'ml-q-4',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'ML Systems & Deployment',
    skill: 'Data Leakage',
    difficulty: 'Hard',
    question: 'Which of the following scenarios represents subtle Data Leakage during ML pipeline engineering?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Fitting a StandardScaler only on the training set and using `transform()` on the test set.', explanation: 'Incorrect: This is the correct, proper way to avoid leakage.' },
      { key: 'B', text: 'Computing mean and standard deviation across the ENTIRE dataset before splitting into train and test sets.', explanation: 'Correct: Fitting transformations on the entire dataset incorporates test distribution information into the training pipeline, causing over-optimistic evaluation.' },
      { key: 'C', text: 'Using 5-fold cross-validation inside the training split.', explanation: 'Incorrect: Stratified k-fold inside training is standard practice.' },
      { key: 'D', text: 'One-hot encoding categorical variables using known vocabulary.', explanation: 'Incorrect: As long as unseen categories are handled, this is standard.' }
    ]
  },
  {
    id: 'ml-q-5',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Feature Engineering',
    skill: 'Categorical Encoding',
    difficulty: 'Medium',
    question: 'When a categorical feature has high cardinality (e.g. 5,000 postal codes), why is One-Hot Encoding usually suboptimal?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'It creates an excessively high-dimensional sparse matrix, dramatically increasing memory consumption and risking the curse of dimensionality.', explanation: 'Correct: 5,000 new columns lead to extreme sparsity, memory blowup, and tree splits that suffer from fragmented samples. Target encoding or embeddings are preferred.' },
      { key: 'B', text: 'It destroys the categorical nature of the data.', explanation: 'Incorrect: It explicitly encodes categories into binary flags.' },
      { key: 'C', text: 'It can only be used with text sentiment analysis.', explanation: 'Incorrect: One-hot encoding applies to any categorical column.' },
      { key: 'D', text: 'It causes gradient descent to oscillate permanently.', explanation: 'Incorrect: The primary concern is dimensionality and sparsity.' }
    ]
  },

  // =========================================================================
  // 6. WEB DEVELOPER (25 Questions)
  // Topics: HTML, CSS, JavaScript, React, Next.js, HTTP, APIs, Web fundamentals, Security
  // =========================================================================
  {
    id: 'web-q-1',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'JavaScript',
    skill: 'Types & Coercion',
    difficulty: 'Easy',
    question: 'What is the output of `typeof null` and `typeof NaN` in JavaScript?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '"object" and "number"', explanation: 'Correct: `typeof null === "object"` is a legacy JS design bug; `typeof NaN === "number"` because NaN represents IEEE 754 unrepresentable numerical results.' },
      { key: 'B', text: '"null" and "nan"', explanation: 'Incorrect: "null" and "nan" are not returned by the typeof operator.' },
      { key: 'C', text: '"undefined" and "number"', explanation: 'Incorrect: typeof null is "object".' },
      { key: 'D', text: '"object" and "undefined"', explanation: 'Incorrect: typeof NaN is "number".' }
    ]
  },
  {
    id: 'web-q-2',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'JavaScript',
    skill: 'Event Loop',
    difficulty: 'Medium',
    question: 'In modern browser JavaScript runtimes, in what order do Microtasks (Promise.then) and Macrotasks (setTimeout) execute?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'setTimeout runs before Promise callbacks.', explanation: 'Incorrect: Promise microtasks run before setTimeout macrotasks.' },
      { key: 'B', text: 'The synchronous call stack executes first, then the entire Microtask queue is drained before the next Macrotask is processed.', explanation: 'Correct: Microtasks (resolved promises, queueMicrotask) have strict priority: the engine drains all microtasks before picking the next task from the timer/macrotask queue.' },
      { key: 'C', text: 'Both queues execute concurrently in separate OS threads.', explanation: 'Incorrect: JavaScript execution is single-threaded per event loop.' },
      { key: 'D', text: 'Macrotasks are executed only during network idle periods.', explanation: 'Incorrect: Timers fire when elapsed regardless of network.' }
    ]
  },
  {
    id: 'web-q-3',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'React',
    skill: 'Hooks & Rendering',
    difficulty: 'Medium',
    question: 'What is the purpose of the `useCallback` hook in React?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'It caches the calculated return value of an expensive mathematical computation.', explanation: 'Incorrect: That is the role of `useMemo`.' },
      { key: 'B', text: 'It returns a memoized version of a callback function that only changes if one of the dependencies has changed, preventing unnecessary child re-renders.', explanation: 'Correct: `useCallback(fn, deps)` caches the function definition between renders, maintaining referential equality for optimized child components (like React.memo).' },
      { key: 'C', text: 'It runs an asynchronous callback immediately after DOM paint.', explanation: 'Incorrect: That is the role of `useEffect`.' },
      { key: 'D', text: 'It replaces the component state with a reducer.', explanation: 'Incorrect: That is `useReducer`.' }
    ]
  },
  {
    id: 'web-q-4',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'HTTP & APIs',
    skill: 'REST & HTTP Methods',
    difficulty: 'Medium',
    question: 'Which HTTP method is defined as IDEMPOTENT according to the HTTP/1.1 specification?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'POST', explanation: 'Incorrect: Making multiple identical POST requests typically results in creating multiple separate resources.' },
      { key: 'B', text: 'PATCH', explanation: 'Incorrect: PATCH is not inherently idempotent as it applies partial delta modifications.' },
      { key: 'C', text: 'PUT and DELETE', explanation: 'Correct: Both PUT (replacing entire resource) and DELETE (deleting resource) are idempotent: making 10 identical calls produces the exact same server resource state as making 1 call.' },
      { key: 'D', text: 'CONNECT', explanation: 'Incorrect: CONNECT establishes tunnels.' }
    ]
  },
  {
    id: 'web-q-5',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'Web Security',
    skill: 'Security & CORS',
    difficulty: 'Hard',
    question: 'What does Cross-Origin Resource Sharing (CORS) enforce?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'It is a browser security mechanism that restricts web pages from making AJAX/Fetch requests to a different domain unless the destination server explicitly returns permissive CORS headers.', explanation: 'Correct: The Same-Origin Policy in browsers blocks reading responses from external origins unless headers like `Access-Control-Allow-Origin` are provided by the server.' },
      { key: 'B', text: 'A server firewall rule that blocks all external curl or Postman requests.', explanation: 'Incorrect: CORS is strictly enforced by web browsers, not non-browser clients.' },
      { key: 'C', text: 'A cryptographic algorithm that encrypts cookie payloads.', explanation: 'Incorrect: CORS governs cross-domain HTTP requests.' },
      { key: 'D', text: 'A protocol for caching CSS files across CDNs.', explanation: 'Incorrect: That is HTTP caching, not CORS.' }
    ]
  },
  {
    id: 'web-q-6',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'HTML/CSS',
    skill: 'CSS Layout',
    difficulty: 'Easy',
    question: 'In CSS Flexbox, which property aligns items along the cross axis (perpendicular to the main axis)?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'justify-content', explanation: 'Incorrect: `justify-content` aligns items along the main axis.' },
      { key: 'B', text: 'align-items', explanation: 'Correct: `align-items` aligns flex items along the cross axis (e.g. vertically if flex-direction is row).' },
      { key: 'C', text: 'flex-wrap', explanation: 'Incorrect: `flex-wrap` controls whether items wrap to multiple lines.' },
      { key: 'D', text: 'flex-direction', explanation: 'Incorrect: `flex-direction` establishes the main axis.' }
    ]
  },
  {
    id: 'web-q-7',
    role: 'Web Developer',
    type: 'MCQ',
    topic: 'React',
    skill: 'Virtual DOM & Keys',
    difficulty: 'Medium',
    question: 'Why should array indexes NEVER be used as the `key` prop for dynamically re-ordered or filtered list items in React?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Because React throws a compile-time SyntaxError.', explanation: 'Incorrect: React accepts index keys syntactically, but logs a runtime warning.' },
      { key: 'B', text: 'Because indexes cause memory leaks in browser garbage collection.', explanation: 'Incorrect: Memory leaks are not caused by key values.' },
      { key: 'C', text: 'Because when items are inserted, deleted, or sorted, items receive different indexes, causing React reconciliation to confuse component states and render stale data.', explanation: 'Correct: React uses keys to match virtual DOM subtrees across renders. Changing indexes destroys component state persistence and causes visual glitches.' },
      { key: 'D', text: 'Because indexes exceed the maximum 32-bit integer limit.', explanation: 'Incorrect: Array indexes are small integers.' }
    ]
  }
];
