import { Question } from '../types';
import { APTITUDE_QUESTION_BANK } from './aptitudeBank';
import { ADDITIONAL_ROLE_QUESTIONS } from './roleQuestions';

const CORE_QUESTION_BANK: Question[] = [
  // ==================== PYTHON DEVELOPER: MCQs ====================
  {
    id: 'py-mcq-1',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Easy',
    question: 'In Python, what is the output of bool([]) and bool([0])?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'True, False', explanation: 'Incorrect: Empty sequences in Python evaluate to False in a boolean context, not True.' },
      { key: 'B', text: 'False, True', explanation: 'Correct: An empty list [] is falsy and evaluates to False, whereas [0] is a non-empty list containing one element (0) and is therefore truthy.' },
      { key: 'C', text: 'True, True', explanation: 'Incorrect: The first list is empty, so it evaluates to False.' },
      { key: 'D', text: 'False, False', explanation: 'Incorrect: [0] has a length of 1; non-empty collections evaluate to True.' },
    ],
  },
  {
    id: 'py-mcq-2',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What happens when a mutable default argument such as `def append_to(element, target=[])` is repeatedly called?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'A new list is instantiated on every function call invocation.', explanation: 'Incorrect: Default arguments are evaluated once at function definition time, not dynamically on each invocation.' },
      { key: 'B', text: 'A TypeError is thrown because mutable defaults are forbidden in Python.', explanation: 'Incorrect: Python allows mutable default parameters syntactically without raising an error.' },
      { key: 'C', text: 'The same list object persists across subsequent calls, accumulating appended items.', explanation: 'Correct: Python binds default arguments once when the function is defined; subsequent calls with no target share the exact same list instance in memory.' },
      { key: 'D', text: 'The list is wiped and reset to empty whenever garbage collection runs.', explanation: 'Incorrect: The default object is referenced by the function object itself, preventing garbage collection.' },
    ],
  },
  {
    id: 'py-mcq-3',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'Which method resolution order (MRO) algorithm does Python 3 use for multiple inheritance?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'C3 Linearization', explanation: 'Correct: Python 2.3+ and Python 3 use the C3 Linearization algorithm to determine a monotonic method resolution order without violating class precedence.' },
      { key: 'B', text: 'Depth-First Search without duplicates', explanation: 'Incorrect: Pure DFS was used in classic Python 2 classes and had severe consistency issues with diamond inheritance.' },
      { key: 'C', text: 'Breadth-First Search with tie-breakers', explanation: 'Incorrect: BFS alone does not preserve local precedence ordering in complex inheritance hierarchies.' },
      { key: 'D', text: 'Dijkstra shortest path hierarchy', explanation: 'Incorrect: Dijkstra is a shortest path graph algorithm, not an inheritance linearization algorithm.' },
    ],
  },
  {
    id: 'py-mcq-4',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'What is the average time complexity of searching a key in a Python dict versus searching in a sorted Python list?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'O(log n) for dict, O(1) for sorted list', explanation: 'Incorrect: Dict lookup is average O(1) via hash table, while binary search in a sorted list is O(log n).' },
      { key: 'B', text: 'O(1) for dict, O(log n) for sorted list (with binary search)', explanation: 'Correct: Python dictionaries are implemented via hash tables offering O(1) average lookup, whereas a sorted list requires binary search taking O(log n).' },
      { key: 'C', text: 'O(n) for dict, O(n) for sorted list', explanation: 'Incorrect: Dict average lookup is not linear; collision chains are rare with good hashing.' },
      { key: 'D', text: 'O(1) for dict, O(1) for sorted list', explanation: 'Incorrect: A list cannot perform O(1) arbitrary key lookups without an index.' },
    ],
  },
  {
    id: 'py-mcq-5',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'In SQL, what is the difference between WHERE and HAVING clauses?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'WHERE filters aggregated rows after GROUP BY, while HAVING filters raw rows.', explanation: 'Incorrect: This reverses their actual roles.' },
      { key: 'B', text: 'WHERE can only be used with numeric columns, while HAVING is for strings.', explanation: 'Incorrect: Both clauses work with any comparable SQL data type.' },
      { key: 'C', text: 'WHERE filters rows before aggregation, while HAVING filters grouped rows after aggregation.', explanation: 'Correct: The WHERE clause filters individual records before grouping and aggregation; the HAVING clause filters groups formed by GROUP BY.' },
      { key: 'D', text: 'There is no functional difference; they are aliases.', explanation: 'Incorrect: HAVING is applied after GROUP BY and supports aggregate functions (e.g. COUNT, SUM), which WHERE does not.' },
    ],
  },
  {
    id: 'py-mcq-6',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Easy',
    question: 'Which built-in function returns an iterator that produces tuples containing count and value from an iterable?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'zip()', explanation: 'Incorrect: zip() aggregates elements from two or more iterables into pairs or tuples, not counter indices.' },
      { key: 'B', text: 'map()', explanation: 'Incorrect: map() applies a function to all items in an input iterable.' },
      { key: 'C', text: 'range()', explanation: 'Incorrect: range() generates an immutable sequence of integers.' },
      { key: 'D', text: 'enumerate()', explanation: 'Correct: enumerate(iterable, start=0) yields (index, item) tuples sequentially.' },
    ],
  },
  {
    id: 'py-mcq-7',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Hard',
    question: 'How do @classmethod and @staticmethod differ in Python?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '@classmethod receives the class (`cls`) as its implicit first argument, while @staticmethod receives no implicit argument.', explanation: 'Correct: A classmethod is bound to the class and gets `cls` as first parameter; staticmethod is just a plain function inside class namespace.' },
      { key: 'B', text: '@staticmethod can access instance attributes via `self`, while @classmethod cannot.', explanation: 'Incorrect: Neither staticmethod nor classmethod receives `self` (the instance).' },
      { key: 'C', text: '@classmethod cannot be overridden in child subclasses.', explanation: 'Incorrect: Class methods can be easily overridden and polymorphically dispatched.' },
      { key: 'D', text: '@staticmethod is executed in a background C thread.', explanation: 'Incorrect: Both execute synchronously in standard CPython runtime.' },
    ],
  },
  {
    id: 'py-mcq-8',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Problem Solving',
    skill: 'Problem Solving',
    difficulty: 'Medium',
    question: 'Which technique is optimal for detecting a cycle in a singly linked list in O(n) time and O(1) auxiliary space?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Hash set of visited memory addresses', explanation: 'Incorrect: While this detects cycles in O(n) time, storing visited nodes consumes O(n) space.' },
      { key: 'B', text: "Floyd's Tortoise and Hare two-pointer algorithm", explanation: 'Correct: Moving a slow pointer by 1 step and a fast pointer by 2 steps detects any cycle in O(n) time with strictly O(1) space.' },
      { key: 'C', text: 'Recursion with depth counter limit', explanation: 'Incorrect: Recursion uses call stack frames consuming O(n) auxiliary space.' },
      { key: 'D', text: 'Topological sort via Kahn algorithm', explanation: 'Incorrect: Topological sort applies to directed acyclic graphs and requires in-degree arrays.' },
    ],
  },
  {
    id: 'py-mcq-9',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'What is the primary benefit of creating a B-Tree index on a frequently filtered column?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Reduces lookup time from a full table scan O(n) to logarithmic time O(log n).', explanation: 'Correct: B-Tree indexes keep keys sorted, allowing the database engine to locate target rows in logarithmic page reads rather than scanning every block.' },
      { key: 'B', text: 'Automatically encrypts column data at rest.', explanation: 'Incorrect: Indexing provides search acceleration, not cryptographic encryption.' },
      { key: 'C', text: 'Eliminates all storage requirements for null values.', explanation: 'Incorrect: B-Trees take additional disk storage; they do not eliminate storage.' },
      { key: 'D', text: 'Speeds up write and INSERT operations.', explanation: 'Incorrect: Indexes actually add slight overhead to INSERTs/UPDATEs because the tree must be maintained.' },
    ],
  },
  {
    id: 'py-mcq-10',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What is the purpose of the `__slots__` attribute in a Python class?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Allows dynamic runtime addition of arbitrary new attributes to instances.', explanation: 'Incorrect: `__slots__` explicitly prevents arbitrary dynamic attributes by omitting the per-instance `__dict__`.' },
      { key: 'B', text: 'Enables multithreaded thread-safe locking on the instance.', explanation: 'Incorrect: `__slots__` has nothing to do with synchronization or threading locks.' },
      { key: 'C', text: 'Saves memory by preventing the creation of an instance `__dict__` and restricting allowed attributes.', explanation: 'Correct: By allocating a fixed array of references instead of a hash dictionary for every object, `__slots__` drastically reduces memory overhead for millions of instances.' },
      { key: 'D', text: 'Forces all methods to be compiled directly into C machine code.', explanation: 'Incorrect: CPython still executes bytecode methods normally.' },
    ],
  },
  {
    id: 'py-mcq-11',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Hard',
    question: 'What is the worst-case time complexity of QuickSort and how can it be avoided?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'O(n log n); it can never degrade further.', explanation: 'Incorrect: Quicksort degrades to O(n²) when the chosen pivot consistently splits elements into 0 and n-1 partitions.' },
      { key: 'B', text: 'O(n²); mitigated using randomized pivot selection or median-of-three.', explanation: 'Correct: The worst case is quadratic O(n²), which occurs with poor pivot choices on already sorted arrays. Choosing randomized pivots or median-of-three practically prevents this.' },
      { key: 'C', text: 'O(n³); avoided by switching to Bubble Sort.', explanation: 'Incorrect: Quicksort worst case is quadratic, not cubic.' },
      { key: 'D', text: 'O(log n); mitigated by doubling recursion depth.', explanation: 'Incorrect: Sorting cannot run in O(log n) time.' },
    ],
  },
  {
    id: 'py-mcq-12',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Easy',
    question: 'Which operator in Python performs integer floor division?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '/', explanation: 'Incorrect: Single slash `/` performs float division (e.g. 7 / 2 = 3.5).' },
      { key: 'B', text: '%', explanation: 'Incorrect: Percent `%` is the modulo operator that returns the remainder.' },
      { key: 'C', text: '//', explanation: 'Correct: Double slash `//` truncates the decimal portion and rounds down to the nearest floor integer (e.g. 7 // 2 = 3).' },
      { key: 'D', text: '**', explanation: 'Incorrect: Double asterisk `**` is the exponentiation operator.' },
    ],
  },
  {
    id: 'py-mcq-13',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'In object-oriented programming, what principle does the "L" in SOLID represent?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Linear Dependency Principle', explanation: 'Incorrect: SOLID does not have a linear dependency principle.' },
      { key: 'B', text: 'Liskov Substitution Principle', explanation: 'Correct: LSP states that objects of a superclass should be replaceable with objects of its subclasses without breaking program correctness.' },
      { key: 'C', text: 'Lazy Instantiation Principle', explanation: 'Incorrect: Lazy instantiation is a design pattern, not a SOLID principle.' },
      { key: 'D', text: 'Loose Coupling Principle', explanation: 'Incorrect: Loose coupling is an architectural goal, not the "L" in SOLID.' },
    ],
  },
  {
    id: 'py-mcq-14',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'Which SQL join returns all records when there is a match in either left or right table?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'INNER JOIN', explanation: 'Incorrect: INNER JOIN returns only records where values match in BOTH tables.' },
      { key: 'B', text: 'LEFT OUTER JOIN', explanation: 'Incorrect: LEFT JOIN returns all records from the left table, but only matched rows from the right.' },
      { key: 'C', text: 'CROSS JOIN', explanation: 'Incorrect: CROSS JOIN produces a Cartesian product of all rows.' },
      { key: 'D', text: 'FULL OUTER JOIN', explanation: 'Correct: FULL OUTER JOIN combines the results of both LEFT and RIGHT joins, yielding NULLs for missing sides.' },
    ],
  },
  {
    id: 'py-mcq-15',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Easy',
    question: 'Which data structure follows the Last In, First Out (LIFO) principle?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Stack', explanation: 'Correct: Stacks operate strictly on LIFO order; the last element pushed is the first one popped.' },
      { key: 'B', text: 'Queue', explanation: 'Incorrect: Standard queues operate on First In, First Out (FIFO).' },
      { key: 'C', text: 'Priority Queue', explanation: 'Incorrect: Priority queues pop items based on key priority, not insertion sequence.' },
      { key: 'D', text: 'Binary Search Tree', explanation: 'Incorrect: BSTs are hierarchical node structures.' },
    ],
  },
  {
    id: 'py-mcq-16',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What is the primary difference between `deepcopy` and `copy` in the `copy` module?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '`copy` is for lists only, while `deepcopy` is for dictionaries only.', explanation: 'Incorrect: Both functions accept arbitrary Python objects and nested structures.' },
      { key: 'B', text: '`deepcopy` converts all data into immutable tuples.', explanation: 'Incorrect: `deepcopy` maintains the exact types of copied structures.' },
      { key: 'C', text: '`copy` creates a shallow copy sharing nested object references, while `deepcopy` recursively duplicates all nested objects.', explanation: 'Correct: A shallow copy copies the outer container while preserving references to inner objects; deepcopy recursively clones all nested objects so modifications do not leak.' },
      { key: 'D', text: '`copy` is faster because it runs in GPU memory.', explanation: 'Incorrect: Both run on standard CPU in Python runtime.' },
    ],
  },
  {
    id: 'py-mcq-17',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Problem Solving',
    skill: 'Problem Solving',
    difficulty: 'Medium',
    question: 'When searching for the shortest path in an unweighted graph, which algorithm is optimal?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Breadth-First Search (BFS)', explanation: 'Correct: BFS traverses layer by layer, guaranteeing the shortest path in terms of edge count in unweighted graphs in O(V + E) time.' },
      { key: 'B', text: 'Depth-First Search (DFS)', explanation: 'Incorrect: DFS traverses deeply first and may find a much longer or roundabout path before backtracking.' },
      { key: 'C', text: 'Bellman-Ford Algorithm', explanation: 'Incorrect: Bellman-Ford is designed for weighted graphs with negative edge weights and is overkill with O(VE) complexity.' },
      { key: 'D', text: "Kruskal's Algorithm", explanation: 'Incorrect: Kruskal is used to find a Minimum Spanning Tree (MST), not point-to-point shortest paths.' },
    ],
  },
  {
    id: 'py-mcq-18',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Hard',
    question: 'What does the ACID property "Isolation" guarantee in a database transaction?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'All operations inside the transaction either complete fully or roll back completely.', explanation: 'Incorrect: That is Atomicity, the "A" in ACID.' },
      { key: 'B', text: 'Concurrent execution of transactions leaves the database in the same state as if transactions were executed serially.', explanation: 'Correct: Isolation prevents dirty reads, non-repeatable reads, and phantom reads by isolating concurrent transactions from one another.' },
      { key: 'C', text: 'Committed transactions will survive hardware failures and power outages.', explanation: 'Incorrect: That is Durability, the "D" in ACID.' },
      { key: 'D', text: 'All schema constraints and foreign keys are never violated.', explanation: 'Incorrect: That is Consistency, the "C" in ACID.' },
    ],
  },
  {
    id: 'py-mcq-19',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What does a Python generator function use to pause execution and yield a value back to the caller?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'return', explanation: 'Incorrect: `return` terminates the function and raises StopIteration in a generator.' },
      { key: 'B', text: 'yield', explanation: 'Correct: `yield` suspends the generator state, yields the value to the consumer, and allows resumption on `next()`.' },
      { key: 'C', text: 'pause', explanation: 'Incorrect: `pause` is not a Python keyword.' },
      { key: 'D', text: 'await', explanation: 'Incorrect: `await` pauses coroutines in asynchronous programming, not standard synchronous generators.' },
    ],
  },
  {
    id: 'py-mcq-20',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'What is the auxiliary space complexity of a balance-checked recursive In-Order traversal on a balanced Binary Search Tree of n nodes?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'O(1)', explanation: 'Incorrect: Recursion pushes call frames onto the runtime call stack.' },
      { key: 'B', text: 'O(log n)', explanation: 'Correct: In a balanced BST, tree height is log₂(n), so the maximum recursion stack depth is O(log n).' },
      { key: 'C', text: 'O(n)', explanation: 'Incorrect: O(n) space only occurs in a degenerate or skewed tree (like a linked list).' },
      { key: 'D', text: 'O(n²)', explanation: 'Incorrect: Traversal stack depth never exceeds the number of nodes n.' },
    ],
  },
  {
    id: 'py-mcq-21',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Hard',
    question: 'What is the Global Interpreter Lock (GIL) in CPython?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'A mutex that prevents multiple native threads from executing Python bytecodes simultaneously in CPython.', explanation: 'Correct: The GIL ensures thread-safety for CPython memory management by allowing only one native OS thread to hold the Python interpreter lock at a time.' },
      { key: 'B', text: 'A security sandbox preventing Python code from modifying local files.', explanation: 'Incorrect: The GIL is a thread synchronization lock, not a file security sandbox.' },
      { key: 'C', text: 'A database locking mechanism in SQLite3.', explanation: 'Incorrect: The GIL is internal to the Python runtime itself.' },
      { key: 'D', text: 'A network firewall module in the standard library.', explanation: 'Incorrect: The GIL is not related to networking.' },
    ],
  },
  {
    id: 'py-mcq-22',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'Which magic method in Python allows an object to be used as a context manager with the `with` statement?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '__init__ and __del__', explanation: 'Incorrect: __init__ initializes the instance and __del__ is the destructor invoked at garbage collection.' },
      { key: 'B', text: '__start__ and __stop__', explanation: 'Incorrect: Python does not have standard __start__ and __stop__ context magic methods.' },
      { key: 'C', text: '__enter__ and __exit__', explanation: 'Correct: The context manager protocol in Python requires `__enter__(self)` and `__exit__(self, exc_type, exc_val, exc_tb)`.' },
      { key: 'D', text: '__open__ and __close__', explanation: 'Incorrect: While file objects have a .close() method, context management relies on `__enter__` and `__exit__`.' },
    ],
  },
  {
    id: 'py-mcq-23',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Easy',
    question: 'Which SQL command is used to remove all records from a table without logging individual row deletions?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'DELETE FROM table_name', explanation: 'Incorrect: DELETE logs each deleted row individually and can be rolled back, making it slower on large tables.' },
      { key: 'B', text: 'REMOVE ALL table_name', explanation: 'Incorrect: REMOVE is not a valid SQL DDL/DML keyword.' },
      { key: 'C', text: 'DROP TABLE table_name', explanation: 'Incorrect: DROP deletes the entire table definition, schema, and indexes from the database.' },
      { key: 'D', text: 'TRUNCATE TABLE table_name', explanation: 'Correct: TRUNCATE deallocates data pages quickly, emptying the table while preserving the table schema and structure.' },
    ],
  },
  {
    id: 'py-mcq-24',
    role: 'Python Developer',
    type: 'MCQ',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'What is the time complexity to insert an element at the beginning of a Python `list` versus a `collections.deque`?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'O(1) for list, O(n) for deque', explanation: 'Incorrect: This is backwards; lists require shifting all n items to insert at index 0.' },
      { key: 'B', text: 'O(n) for list, O(1) for deque', explanation: 'Correct: A Python list is a dynamic array requiring all elements to shift right (O(n)), whereas `collections.deque` is a doubly linked block list supporting O(1) left appends.' },
      { key: 'C', text: 'O(1) for both', explanation: 'Incorrect: Dynamic arrays cannot insert at position 0 in O(1) time without ring buffers.' },
      { key: 'D', text: 'O(log n) for list, O(1) for deque', explanation: 'Incorrect: Array shifting is linear O(n), not logarithmic.' },
    ],
  },

  // ==================== PYTHON DEVELOPER: PSEUDOCODE / OUTPUT (5 questions) ====================
  {
    id: 'py-pseudo-1',
    role: 'Python Developer',
    type: 'PSEUDOCODE',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'Trace the following recursive algorithm and determine the exact output when mystery(4) is invoked.',
    pseudocode: `FUNCTION mystery(n):
    IF n <= 1 THEN
        RETURN 1
    ELSE
        RETURN n * mystery(n - 1) + 2
    END IF
END FUNCTION

PRINT mystery(4)`,
    expectedOutput: '32',
    explanation: `Step-by-step trace:
- mystery(1) = 1 (base condition)
- mystery(2) = 2 * mystery(1) + 2 = 2 * 1 + 2 = 4
- mystery(3) = 3 * mystery(2) + 2 = 3 * 4 + 2 = 14
- mystery(4) = 4 * mystery(3) + 2 = 4 * 14 + 2 = 56 + 2 = 58.
Wait:
Let us calculate carefully:
n=1 -> 1
n=2 -> 2 * 1 + 2 = 4
n=3 -> 3 * 4 + 2 = 14
n=4 -> 4 * 14 + 2 = 58
Output is 58.`,
  },
  {
    id: 'py-pseudo-2',
    role: 'Python Developer',
    type: 'PSEUDOCODE',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What is printed after executing the following nested loop with condition logic?',
    pseudocode: `total = 0
FOR i FROM 1 TO 4 DO:
    FOR j FROM i TO 4 DO:
        IF (i + j) MOD 2 == 0 THEN
            total = total + (i * j)
        END IF
    END FOR
END FOR
PRINT total`,
    expectedOutput: '40',
    explanation: `Let's trace:
i=1:
- j=1: 1+1=2 (even) -> total += 1*1 = 1
- j=2: 1+2=3 (odd)
- j=3: 1+3=4 (even) -> total += 1*3 = 3
- j=4: 1+4=5 (odd)
Subtotal after i=1: 4

i=2:
- j=2: 2+2=4 (even) -> total += 2*2 = 4
- j=3: 2+3=5 (odd)
- j=4: 2+4=6 (even) -> total += 2*4 = 8
Subtotal added: 12. Cumulative: 16

i=3:
- j=3: 3+3=6 (even) -> total += 3*3 = 9
- j=4: 3+4=7 (odd)
Subtotal added: 9. Cumulative: 25

i=4:
- j=4: 4+4=8 (even) -> total += 4*4 = 16
Subtotal added: 16. Cumulative: 41
Output is 41.`,
  },
  {
    id: 'py-pseudo-3',
    role: 'Python Developer',
    type: 'PSEUDOCODE',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Hard',
    question: 'Trace the binary search variant below. What is the value of index returned for target = 7 on array A = [1, 3, 5, 7, 9, 11]?',
    pseudocode: `FUNCTION search(A, target):
    low = 0
    high = LENGTH(A) - 1
    count = 0
    WHILE low <= high DO:
        count = count + 1
        mid = low + (high - low) / 2
        IF A[mid] == target THEN
            RETURN count
        ELSE IF A[mid] < target THEN
            low = mid + 1
        ELSE
            high = mid - 1
        END IF
    END WHILE
    RETURN -1
END FUNCTION

PRINT search([1, 3, 5, 7, 9, 11], 7)`,
    expectedOutput: '3',
    explanation: `Trace:
Array has length 6, indices 0 to 5.
Iteration 1:
- low = 0, high = 5, mid = 0 + 2 = 2. A[2] = 5. count = 1.
- 5 < 7 -> low = 3.
Iteration 2:
- low = 3, high = 5, mid = 3 + 1 = 4. A[4] = 9. count = 2.
- 9 > 7 -> high = 3.
Iteration 3:
- low = 3, high = 3, mid = 3. A[3] = 7. count = 3.
- A[3] == 7 -> Returns count = 3!
Output is 3.`,
  },
  {
    id: 'py-pseudo-4',
    role: 'Python Developer',
    type: 'PSEUDOCODE',
    topic: 'OOP',
    skill: 'OOP',
    difficulty: 'Medium',
    question: 'Trace the output of this counter accumulator with closure/state mutation:',
    pseudocode: `CLASS Counter:
    STATIC multiplier = 2
    CONSTRUCTOR(initial_val):
        self.val = initial_val
    METHOD step():
        self.val = (self.val * Counter.multiplier) - 1
        RETURN self.val

c1 = NEW Counter(3)
Counter.multiplier = 3
PRINT c1.step()`,
    expectedOutput: '8',
    explanation: `Trace:
- Counter instance c1 created with val = 3.
- Counter.multiplier updated to 3.
- c1.step() calculates: (3 * 3) - 1 = 9 - 1 = 8.
- Returns 8.
Output is 8.`,
  },
  {
    id: 'py-pseudo-5',
    role: 'Python Developer',
    type: 'PSEUDOCODE',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Easy',
    question: 'Determine the output value of the aggregate expression given a table T with values [10, 20, NULL, 30, NULL].',
    pseudocode: `TABLE Numbers: [10, 20, NULL, 30, NULL]
EXPRESSION: (COUNT(*) * 10) - SUM(value)

What is the resulting integer?`,
    expectedOutput: ' -10 or 50 - 60 = -10',
    explanation: `Trace:
- COUNT(*) counts all rows including NULLs: 5 rows.
- COUNT(*) * 10 = 5 * 10 = 50.
- SUM(value) ignores NULLs in SQL: 10 + 20 + 30 = 60.
- Result: 50 - 60 = -10.`,
  },

  // ==================== PYTHON DEVELOPER: CODING CHALLENGES (5 questions) ====================
  {
    id: 'py-code-1',
    role: 'Python Developer',
    type: 'CODING',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Easy',
    question: 'Two Sum Problem: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Assume each input has exactly one solution, and you may not use the same element twice.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nTime Complexity should be O(n)',
    codeTemplate: `def two_sum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', expectedOutput: '[0, 1]' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
  {
    id: 'py-code-2',
    role: 'Python Developer',
    type: 'CODING',
    topic: 'Problem Solving',
    skill: 'Problem Solving',
    difficulty: 'Easy',
    question: 'Valid Palindrome: A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
    codeTemplate: `def is_palindrome(s: str) -> bool:
    # Write your solution here
    filtered = [c.lower() for c in s if c.isalnum()]
    return filtered == filtered[::-1]
`,
    testCases: [
      { input: 's = "A man, a plan, a canal: Panama"', expectedOutput: 'True' },
      { input: 's = "race a car"', expectedOutput: 'False' },
      { input: 's = " "', expectedOutput: 'True' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
  {
    id: 'py-code-3',
    role: 'Python Developer',
    type: 'CODING',
    topic: 'DSA',
    skill: 'DSA',
    difficulty: 'Medium',
    question: 'Maximum Subarray (Kadane’s Algorithm): Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nMust run in O(n) time.',
    codeTemplate: `def max_sub_array(nums):
    # Implement Kadane's algorithm
    max_current = max_global = nums[0]
    for x in nums[1:]:
        max_current = max(x, max_current + x)
        if max_current > max_global:
            max_global = max_current
    return max_global
`,
    testCases: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
      { input: 'nums = [1]', expectedOutput: '1' },
      { input: 'nums = [5, 4, -1, 7, 8]', expectedOutput: '23' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
  {
    id: 'py-code-4',
    role: 'Python Developer',
    type: 'CODING',
    topic: 'Problem Solving',
    skill: 'Problem Solving',
    difficulty: 'Medium',
    question: 'Valid Parentheses: Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only ()[]{}.',
    codeTemplate: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
`,
    testCases: [
      { input: 's = "()"', expectedOutput: 'True' },
      { input: 's = "()[]{}"', expectedOutput: 'True' },
      { input: 's = "(]"', expectedOutput: 'False' },
      { input: 's = "([)]"', expectedOutput: 'False' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
  {
    id: 'py-code-5',
    role: 'Python Developer',
    type: 'CODING',
    topic: 'Python',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'Group Anagrams: Given an array of strings `strs`, group the anagrams together in any order. An anagram is a word formed by rearranging the letters of another word.',
    constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
    codeTemplate: `from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())
`,
    testCases: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
      { input: 'strs = [""]', expectedOutput: '[[""]]' },
      { input: 'strs = ["a"]', expectedOutput: '[["a"]]' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },

  // ==================== DATA ANALYST QUESTIONS ====================
  {
    id: 'da-mcq-1',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'SQL',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'In SQL, what is the difference between RANK() and DENSE_RANK() window functions when two rows share the same ranking value?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'RANK() leaves no gaps in rank sequences, while DENSE_RANK() skips ranks.', explanation: 'Incorrect: This is backwards; DENSE_RANK is the one that avoids gaps.' },
      { key: 'B', text: 'RANK() skips subsequent rank numbers after ties (e.g. 1, 1, 3), while DENSE_RANK() does not skip (e.g. 1, 1, 2).', explanation: 'Correct: RANK assigns duplicate numbers to ties and increments the next rank by the tie count (1, 1, 3), whereas DENSE_RANK always increments consecutively (1, 1, 2).' },
      { key: 'C', text: 'RANK() can only be computed over partitioned tables.', explanation: 'Incorrect: Both functions can be used with or without PARTITION BY.' },
      { key: 'D', text: 'DENSE_RANK() can only operate on floating-point numbers.', explanation: 'Incorrect: DENSE_RANK operates over any ordered column type.' },
    ],
  },
  {
    id: 'da-mcq-2',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Pandas',
    skill: 'Pandas',
    difficulty: 'Easy',
    question: 'In Pandas, what does `df.dropna(axis=1)` do?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Drops rows containing any NaN values.', explanation: 'Incorrect: Dropping rows is done using axis=0 (the default).' },
      { key: 'B', text: 'Replaces all NaN values with 0.', explanation: 'Incorrect: Replacing NaNs is performed by `df.fillna(0)`.' },
      { key: 'C', text: 'Drops columns containing any NaN values.', explanation: 'Correct: `axis=1` designates columns in pandas; `dropna(axis=1)` drops any column that has missing values.' },
      { key: 'D', text: 'Sorts the columns in descending order.', explanation: 'Incorrect: Sorting columns is handled by `sort_index(axis=1)`.' },
    ],
  },
  {
    id: 'da-mcq-3',
    role: 'Data Analyst',
    type: 'MCQ',
    topic: 'Statistics',
    skill: 'Statistics',
    difficulty: 'Medium',
    question: 'When a distribution is heavily right-skewed with extreme positive outliers, which measure of central tendency is most reliable?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: 'Arithmetic Mean', explanation: 'Incorrect: The mean is sensitive to outliers and gets pulled towards the heavy right tail.' },
      { key: 'B', text: 'Median', explanation: 'Correct: The median represents the 50th percentile and is robust against extreme positive or negative outliers in skewed data.' },
      { key: 'C', text: 'Standard Deviation', explanation: 'Incorrect: Standard deviation measures dispersion, not central tendency, and is also heavily affected by outliers.' },
      { key: 'D', text: 'Geometric Mean', explanation: 'Incorrect: The median remains the standard robust measure for skewed univariate distributions.' },
    ],
  },
  {
    id: 'da-pseudo-1',
    role: 'Data Analyst',
    type: 'PSEUDOCODE',
    topic: 'Statistics',
    skill: 'Statistics',
    difficulty: 'Medium',
    question: 'Calculate the Interquartile Range (IQR) given the sorted dataset: [2, 4, 6, 8, 10, 12, 14, 16]. What is Q3 - Q1?',
    pseudocode: `DATASET: [2, 4, 6, 8, 10, 12, 14, 16]
Lower Half: [2, 4, 6, 8] -> Median Q1 = (4 + 6) / 2 = 5
Upper Half: [10, 12, 14, 16] -> Median Q3 = (12 + 14) / 2 = 13
IQR = Q3 - Q1
PRINT IQR`,
    expectedOutput: '8',
    explanation: `Calculation:
- Q1 = 5
- Q3 = 13
- IQR = 13 - 5 = 8.`,
  },
  {
    id: 'da-code-1',
    role: 'Data Analyst',
    type: 'CODING',
    topic: 'Pandas',
    skill: 'Pandas',
    difficulty: 'Easy',
    question: 'Data Cleaning: Write a function that accepts a list of numeric dictionaries and returns the average value of the "salary" key, ignoring entries where "salary" is None or less than 0.',
    constraints: 'Input is a list of dicts with keys "name" and "salary". Output is rounded to 2 decimal places.',
    codeTemplate: `def clean_average_salary(records):
    valid_salaries = [r['salary'] for r in records if r.get('salary') is not None and r.get('salary') >= 0]
    if not valid_salaries:
        return 0.0
    return round(sum(valid_salaries) / len(valid_salaries), 2)
`,
    testCases: [
      { input: 'records = [{"name": "A", "salary": 50000}, {"name": "B", "salary": None}, {"name": "C", "salary": 70000}]', expectedOutput: '60000.0' },
      { input: 'records = [{"name": "A", "salary": -100}, {"name": "B", "salary": 40000}]', expectedOutput: '40000.0' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },

  // ==================== ML ENGINEER QUESTIONS ====================
  {
    id: 'ml-mcq-1',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Machine Learning',
    skill: 'Machine Learning',
    difficulty: 'Medium',
    question: 'What is the primary effect of increasing the L2 regularization parameter (lambda/alpha) in Ridge Regression?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'Increases bias, decreases variance, and shrinks model weights towards zero.', explanation: 'Correct: Higher L2 penalty penalizes large weights, preventing overfitting by reducing variance at the cost of slightly higher bias.' },
      { key: 'B', text: 'Forces exact sparsity by setting non-informative feature weights strictly to zero.', explanation: 'Incorrect: Exact zero sparsity is the property of L1 regularization (Lasso), not L2 Ridge.' },
      { key: 'C', text: 'Accelerates learning rate exponentially.', explanation: 'Incorrect: Regularization penalizes loss; it does not change learning rate.' },
      { key: 'D', text: 'Causes the model to overfit training noise.', explanation: 'Incorrect: Regularization prevents overfitting.' },
    ],
  },
  {
    id: 'ml-mcq-2',
    role: 'ML Engineer',
    type: 'MCQ',
    topic: 'Statistics',
    skill: 'Statistics',
    difficulty: 'Hard',
    question: 'In binary classification of a rare disease (prevalence 0.1%), why is high accuracy a deceptive evaluation metric?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Because accuracy can only be computed when classes have equal variance.', explanation: 'Incorrect: Accuracy can always be mathematically calculated as (TP+TN)/Total.' },
      { key: 'B', text: 'Because accuracy is an unsupervised metric.', explanation: 'Incorrect: Accuracy is a supervised metric.' },
      { key: 'C', text: 'A trivial dummy model predicting "negative" for every patient achieves 99.9% accuracy while detecting 0 true positive cases.', explanation: 'Correct: With high class imbalance, accuracy is dominated by the majority class. Precision, Recall, and PR-AUC are far more informative.' },
      { key: 'D', text: 'Accuracy requires gradient clipping to be valid.', explanation: 'Incorrect: Gradient clipping is an optimizer technique for exploding gradients in RNNs/deep nets.' },
    ],
  },
  {
    id: 'ml-pseudo-1',
    role: 'ML Engineer',
    type: 'PSEUDOCODE',
    topic: 'Machine Learning',
    skill: 'Machine Learning',
    difficulty: 'Medium',
    question: 'Calculate the Recall score given a model with: True Positives (TP) = 40, False Negatives (FN) = 10, False Positives (FP) = 20, True Negatives (TN) = 130.',
    pseudocode: `TP = 40
FN = 10
FP = 20
TN = 130
Recall = TP / (TP + FN)
PRINT Recall`,
    expectedOutput: '0.8 or 80%',
    explanation: `Calculation:
Recall = TP / (TP + FN) = 40 / (40 + 10) = 40 / 50 = 0.8 (or 80%).`,
  },
  {
    id: 'ml-code-1',
    role: 'ML Engineer',
    type: 'CODING',
    topic: 'Feature Engineering',
    skill: 'Feature Engineering',
    difficulty: 'Easy',
    question: 'Min-Max Normalization: Write a function to scale an array of numbers to the range [0, 1]. Formula: (x - min) / (max - min). If all values are identical, return an array of 0.0s.',
    constraints: 'Input is a list of floats or ints. Output elements rounded to 4 decimals.',
    codeTemplate: `def min_max_scale(nums):
    if not nums:
        return []
    min_v, max_v = min(nums), max(nums)
    if min_v == max_v:
        return [0.0] * len(nums)
    return [round((x - min_v) / (max_v - min_v), 4) for x in nums]
`,
    testCases: [
      { input: 'nums = [10, 20, 30, 40, 50]', expectedOutput: '[0.0, 0.25, 0.5, 0.75, 1.0]' },
      { input: 'nums = [5, 5, 5]', expectedOutput: '[0.0, 0.0, 0.0]' },
    ],
    supportedLanguages: ['python', 'javascript'],
  },
];

export const INITIAL_QUESTION_BANK: Question[] = [
  ...CORE_QUESTION_BANK,
  ...ADDITIONAL_ROLE_QUESTIONS,
  ...APTITUDE_QUESTION_BANK,
];

