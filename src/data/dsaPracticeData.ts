export interface DsaTopic {
  id: string;
  name: string;
  description: string;
  timeComplexityCheat: string;
  spaceComplexityCheat: string;
  problems: DsaProblem[];
}

export interface DsaProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  problemStatement: string;
  inputExample: string;
  outputExample: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyTechnique: string;
  solutionExplanation: string[];
  pythonCode: string;
  javaCode: string;
  cppCode: string;
}

export const DSA_PRACTICE_TOPICS: DsaTopic[] = [
  {
    id: 'arrays-strings',
    name: 'Arrays & Strings',
    description: 'Two pointers, sliding window, prefix sums, and kadane algorithm for contiguous subarray analysis.',
    timeComplexityCheat: 'Access: O(1) | Search: O(N) | Insertion/Deletion: O(N)',
    spaceComplexityCheat: 'Contiguous memory layout; O(1) auxiliary for two-pointers.',
    problems: [
      {
        id: 'dsa-arr-1',
        title: 'Two Sum (Optimal Hash Map Approach)',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Google', 'TCS Digital', 'Zoho'],
        problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution, and you may not use the same element twice.',
        inputExample: 'nums = [2, 7, 11, 15], target = 9',
        outputExample: '[0, 1] (because nums[0] + nums[1] == 9)',
        timeComplexity: 'O(N) single pass',
        spaceComplexity: 'O(N) for hash map',
        keyTechnique: 'Complement lookup using Hash Map (target - current_val)',
        solutionExplanation: [
          'Initialize an empty hash map storing value -> index.',
          'Iterate through the array; for each number x, calculate complement = target - x.',
          'If complement exists in map, return [map[complement], current_index].',
          'Otherwise, store current value and index into the map and continue.'
        ],
        pythonCode: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
        javaCode: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
        cppCode: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (mp.count(comp)) return {mp[comp], i};
        mp[nums[i]] = i;
    }
    return {};
}`
      },
      {
        id: 'dsa-arr-2',
        title: 'Maximum Subarray (Kadane Algorithm)',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Infosys SP', 'Amazon'],
        problemStatement: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        inputExample: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        outputExample: '6 (subarray [4, -1, 2, 1])',
        timeComplexity: 'O(N) single linear traversal',
        spaceComplexity: 'O(1) constant auxiliary space',
        keyTechnique: 'Dynamic programming state: max(x, current_sum + x)',
        solutionExplanation: [
          'Maintain current_sum tracking running sum and max_sum tracking global maximum.',
          'At each element, decide whether to start a new subarray at current element or extend previous subarray: current_sum = max(num, current_sum + num).',
          'Update max_sum = max(max_sum, current_sum).'
        ],
        pythonCode: `def max_sub_array(nums):
    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
        javaCode: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
        cppCode: `int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0], curSum = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        curSum = max(nums[i], curSum + nums[i]);
        maxSum = max(maxSum, curSum);
    }
    return maxSum;
}`
      }
    ]
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Pointer manipulation, fast & slow pointers (Floyd cycle detection), and in-place node reversal.',
    timeComplexityCheat: 'Prepend/Append: O(1) with tail | Search: O(N) | Deletion: O(1) if node known',
    spaceComplexityCheat: 'Non-contiguous nodes; requires extra pointer storage per element.',
    problems: [
      {
        id: 'dsa-ll-1',
        title: 'Reverse a Singly Linked List (In-Place)',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Cognizant', 'Wipro Turbo', 'TCS'],
        problemStatement: 'Given the head of a singly linked list, reverse the list in-place and return the reversed list head.',
        inputExample: 'head = [1, 2, 3, 4, 5]',
        outputExample: '[5, 4, 3, 2, 1]',
        timeComplexity: 'O(N) where N is number of nodes',
        spaceComplexity: 'O(1) in-place iterative reversal',
        keyTechnique: 'Three-pointer technique: prev, curr, next_node',
        solutionExplanation: [
          'Maintain a prev pointer initialized to null, and curr pointer initialized to head.',
          'In each iteration, save curr.next into next_temp.',
          'Reverse curr.next to point to prev.',
          'Advance prev to curr, and curr to next_temp.',
          'When curr becomes null, prev is the new head of reversed list.'
        ],
        pythonCode: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
        javaCode: `public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
        cppCode: `ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`
      },
      {
        id: 'dsa-ll-2',
        title: 'Detect Cycle in Linked List (Floyd Tortoise & Hare)',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Google', 'Accenture'],
        problemStatement: 'Given head, determine if the linked list has a cycle in it. Return true if there is some node that can be reached again by continuously following next pointer.',
        inputExample: 'head = [3, 2, 0, -4], pos = 1 (tail connects to node index 1)',
        outputExample: 'true',
        timeComplexity: 'O(N) linear time',
        spaceComplexity: 'O(1) auxiliary pointers without hash set',
        keyTechnique: 'Two pointers moving at different speeds (slow 1 step, fast 2 steps)',
        solutionExplanation: [
          'Initialize slow = head and fast = head.',
          'Traverse while fast and fast.next are non-null.',
          'Advance slow by 1 step and fast by 2 steps.',
          'If slow == fast at any point, a cycle exists; return true.',
          'If fast reaches null, list terminates with no cycle; return false.'
        ],
        pythonCode: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
        javaCode: `public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
        cppCode: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`
      }
    ]
  },
  {
    id: 'stacks-queues',
    name: 'Stacks & Queues',
    description: 'LIFO & FIFO mechanics, monotonic stacks, bracket validation, and sliding window maximums.',
    timeComplexityCheat: 'Push: O(1) | Pop: O(1) | Top/Peek: O(1)',
    spaceComplexityCheat: 'O(N) worst case storage for elements.',
    problems: [
      {
        id: 'dsa-sq-1',
        title: 'Valid Parentheses String Validation',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Bloomberg', 'TCS', 'Capgemini'],
        problemStatement: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid (open brackets closed by same type in correct order).',
        inputExample: 's = "()[]{}"',
        outputExample: 'true',
        timeComplexity: 'O(N) single character pass',
        spaceComplexity: 'O(N) stack size',
        keyTechnique: 'Stack LIFO matching with bracket mapping dictionary',
        solutionExplanation: [
          'Map closing brackets to their corresponding opening brackets.',
          'Iterate through characters: if opening bracket, push to stack.',
          'If closing bracket, check if stack is non-empty and top matches; if not, return false.',
          'At the end, string is valid only if stack is empty.'
        ],
        pythonCode: `def is_valid_parentheses(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
        javaCode: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}`,
        cppCode: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }
    return st.empty();
}`
      }
    ]
  },
  {
    id: 'trees-bst',
    name: 'Binary Trees & BST',
    description: 'Tree traversals (Inorder, Preorder, Postorder, Level-order), Lowest Common Ancestor, and BST invariants.',
    timeComplexityCheat: 'Balanced BST Search/Insert: O(log N) | Unbalanced: O(N) | Traversal: O(N)',
    spaceComplexityCheat: 'Recursion stack: O(H) where H is tree height (log N balanced, N skewed).',
    problems: [
      {
        id: 'dsa-tree-1',
        title: 'Maximum Depth / Height of Binary Tree',
        difficulty: 'Easy',
        companyTags: ['Google', 'Microsoft', 'Zoho', 'Oracle'],
        problemStatement: 'Given the root of a binary tree, return its maximum depth (the number of nodes along the longest path from root node down to farthest leaf node).',
        inputExample: 'root = [3, 9, 20, null, null, 15, 7]',
        outputExample: '3',
        timeComplexity: 'O(N) visiting each node exactly once',
        spaceComplexity: 'O(H) recursion stack height',
        keyTechnique: 'Recursive Divide & Conquer (DFS) or Queue-based BFS level counting',
        solutionExplanation: [
          'Base case: if root is null, depth is 0.',
          'Recursively compute left depth = max_depth(root.left).',
          'Recursively compute right depth = max_depth(root.right).',
          'Return 1 + max(left_depth, right_depth).'
        ],
        pythonCode: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
        javaCode: `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        cppCode: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`
      },
      {
        id: 'dsa-tree-2',
        title: 'Validate Binary Search Tree (BST Invariant Check)',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Goldman Sachs', 'Infosys'],
        problemStatement: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). Left subtree contains keys strictly less than node, right subtree keys strictly greater than node.',
        inputExample: 'root = [2, 1, 3]',
        outputExample: 'true',
        timeComplexity: 'O(N) every node checked once',
        spaceComplexity: 'O(H) recursion call stack',
        keyTechnique: 'Range validation passing (low, high) bounds down the recursion',
        solutionExplanation: [
          'A node is valid if low < node.val < high.',
          'For left child, upper bound becomes current node value: (low, node.val).',
          'For right child, lower bound becomes current node value: (node.val, high).',
          'Both subtrees must return true.'
        ],
        pythonCode: `def is_valid_bst(root):
    def validate(node, low=float('-inf'), high=float('inf')):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return validate(node.left, low, node.val) and validate(node.right, node.val, high)
    return validate(root)`,
        javaCode: `public boolean isValidBST(TreeNode root) {
    return validate(root, null, null);
}
private boolean validate(TreeNode node, Integer low, Integer high) {
    if (node == null) return true;
    if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;
    return validate(node.left, low, node.val) && validate(node.right, node.val, high);
}`,
        cppCode: `bool isValidBST(TreeNode* root) {
    return validate(root, LONG_MIN, LONG_MAX);
}
bool validate(TreeNode* node, long low, long high) {
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return validate(node->left, low, node->val) && validate(node->right, node->val, high);
}`
      }
    ]
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimal substructure and overlapping subproblems: memoization (top-down) and tabulation (bottom-up).',
    timeComplexityCheat: 'Subproblems Count * Time per Subproblem | Often O(N) or O(N*W)',
    spaceComplexityCheat: 'O(N) table or O(1) state reduction using rolling variables.',
    problems: [
      {
        id: 'dsa-dp-1',
        title: 'Climbing Stairs (Fibonacci DP Recurrence)',
        difficulty: 'Easy',
        companyTags: ['Adobe', 'TCS Digital', 'Accenture', 'Amazon'],
        problemStatement: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?',
        inputExample: 'n = 3',
        outputExample: '3 (Ways: 1+1+1, 1+2, 2+1)',
        timeComplexity: 'O(N) single linear loop',
        spaceComplexity: 'O(1) using two rolling variables',
        keyTechnique: 'Recurrence: dp[i] = dp[i-1] + dp[i-2]',
        solutionExplanation: [
          'Base cases: for n=1 -> 1 way; for n=2 -> 2 ways.',
          'To reach step i, you can either step from i-1 or from i-2.',
          'Instead of maintaining full array, keep track of two previous step counts: prev1, prev2.',
          'Iterate from 3 to n, rolling variables forward.'
        ],
        pythonCode: `def climb_stairs(n):
    if n <= 2:
        return n
    first, second = 1, 2
    for _ in range(3, n + 1):
        first, second = second, first + second
    return second`,
        javaCode: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int first = 1, second = 2;
    for (int i = 3; i <= n; i++) {
        int third = first + second;
        first = second;
        second = third;
    }
    return second;
}`,
        cppCode: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`
      },
      {
        id: 'dsa-dp-2',
        title: '0/1 Knapsack Problem',
        difficulty: 'Medium',
        companyTags: ['Morgan Stanley', 'Microsoft', 'Flipkart'],
        problemStatement: 'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value in the knapsack. Each item can be picked at most once.',
        inputExample: 'W = 4, weights = [1, 2, 3], values = [10, 15, 40]',
        outputExample: '55 (Pick items 2 & 3: weight 1+3=4, value 10+40=50 or items 2&3: weight 2+3=5 (exceeds), best is item 1 & 3: weight 1+3=4 -> 10+40=50 or 2+1=3 -> 25)',
        timeComplexity: 'O(N * W)',
        spaceComplexity: 'O(W) using 1D space optimized array traversed backwards',
        keyTechnique: 'dp[w] = max(dp[w], dp[w - weight[i]] + value[i])',
        solutionExplanation: [
          'Create 1D dp array of size W+1 initialized to 0.',
          'For each item (weight, val), loop backwards from capacity W down to weight.',
          'Updating backwards ensures each item is used at most once.',
          'dp[W] gives maximum achievable value.'
        ],
        pythonCode: `def knap_sack(W, weights, values, n):
    dp = [0] * (W + 1)
    for i in range(n):
        w, v = weights[i], values[i]
        for cap in range(W, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[W]`,
        javaCode: `public int knapSack(int W, int[] weights, int[] values, int n) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < n; i++) {
        for (int cap = W; cap >= weights[i]; cap--) {
            dp[cap] = Math.max(dp[cap], dp[cap - weights[i]] + values[i]);
        }
    }
    return dp[W];
}`,
        cppCode: `int knapSack(int W, vector<int>& weights, vector<int>& values) {
    vector<int> dp(W + 1, 0);
    for (size_t i = 0; i < weights.size(); ++i) {
        for (int cap = W; cap >= weights[i]; --cap) {
            dp[cap] = max(dp[cap], dp[cap - weights[i]] + values[i]);
        }
    }
    return dp[W];
}`
      }
    ]
  },
  {
    id: 'sorting-searching',
    name: 'Searching & Sorting',
    description: 'Binary Search variants (search in rotated sorted array), Quick Select, Merge Sort, and Dutch National Flag algorithm.',
    timeComplexityCheat: 'Binary Search: O(log N) | Merge/Quick Sort: O(N log N) average',
    spaceComplexityCheat: 'Merge Sort: O(N) auxiliary | Quick Sort: O(log N) stack | In-place Binary Search: O(1)',
    problems: [
      {
        id: 'dsa-sort-1',
        title: 'Binary Search on Sorted Array',
        difficulty: 'Easy',
        companyTags: ['TCS', 'Wipro', 'Amazon', 'Cognizant'],
        problemStatement: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
        inputExample: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        outputExample: '4',
        timeComplexity: 'O(log N) logarithmic halving',
        spaceComplexity: 'O(1) iterative two pointers',
        keyTechnique: 'Midpoint calculation `mid = left + (right - left) // 2` preventing integer overflow',
        solutionExplanation: [
          'Initialize left = 0, right = len(nums) - 1.',
          'While left <= right, calculate mid = left + (right - left) // 2.',
          'If nums[mid] == target, return mid.',
          'If nums[mid] < target, target must be in right half; left = mid + 1.',
          'Else target in left half; right = mid - 1.',
          'If not found after loop, return -1.'
        ],
        pythonCode: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        javaCode: `public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        cppCode: `int search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
      }
    ]
  }
];
