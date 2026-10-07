import { Difficulty, ProgrammingLanguage, TestCase } from '../types';

export type DsaCategory =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack'
  | 'Binary Search'
  | 'Linked List'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming';

export interface DsaExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DsaSolutionBreakdown {
  approach: string;
  intuition: string;
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  keyTakeaways: string[];
}

export interface DsaProblemItem {
  id: string;
  title: string;
  category: DsaCategory;
  pattern: string;
  difficulty: Difficulty;
  statement: string;
  examples: DsaExample[];
  constraints: string[];
  supportedLanguages: ProgrammingLanguage[];
  starterCode: Record<ProgrammingLanguage, string>;
  solutionCode: Record<ProgrammingLanguage, string>;
  solution: DsaSolutionBreakdown;
  testCases: TestCase[];
}

export interface DsaUserProgress {
  problemId: string;
  status: 'Not Started' | 'Attempted' | 'Solved';
  attemptsCount: number;
  successfulSubmissions: number;
  lastAttemptedAt?: string;
  submittedCode?: Partial<Record<ProgrammingLanguage, string>>;
}

export const INITIAL_5_DSA_PROBLEMS: DsaProblemItem[] = [
  // =========================================================================
  // 1. ARRAYS & HASHING (Pattern: Hash Map Lookup)
  // =========================================================================
  {
    id: 'dsa-1-two-sum',
    title: 'Two Sum',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map Lookup',
    difficulty: 'Easy',
    statement:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    supportedLanguages: ['python', 'javascript', 'java', 'c', 'cpp'],
    starterCode: {
      python: `def two_sum(nums, target):
    # Return list of two indices [i, j]
    pass
`,
      javascript: `function twoSum(nums, target) {
    // Return array of two indices [i, j]
    return [];
}
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Return int array with two indices
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String line = sc.nextLine().trim();
        // Custom parser or test cases
    }
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Read input from stdin and print result [i, j]
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Implement hash map solution
    return {};
}

int main() {
    // Standard I/O
    return 0;
}
`,
      sql: `-- SQL not applicable for DSA algorithmic challenges`,
    },
    solutionCode: {
      python: `def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []
`,
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int n = 4;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("[%d, %d]\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}
`,
      sql: `-- N/A`,
    },
    solution: {
      approach:
        'Instead of checking all pairs with brute force (O(n²)), use a hash table to store previously seen numbers and their indices. As we traverse the array, we compute the required complement (target - current_number) and check if it already exists in the table in O(1) average time.',
      intuition:
        'A single pass allows us to look backward into what we have already encountered. When complement exists, we immediately pair it with the current index.',
      timeComplexity: 'O(n)',
      timeExplanation: 'Traverse the list containing n elements only once. Each hash table lookup and insertion takes O(1) average time.',
      spaceComplexity: 'O(n)',
      spaceExplanation: 'The hash table stores up to n elements in the worst case.',
      keyTakeaways: [
        'Trade space for time by caching previous items into a hash map.',
        'Always check for complement before inserting the current item to prevent using the same index twice.',
      ],
    },
    testCases: [
      {
        input: '[2, 7, 11, 15], 9',
        expectedOutput: '[0, 1]',
        isHidden: false,
      },
      {
        input: '[3, 2, 4], 6',
        expectedOutput: '[1, 2]',
        isHidden: false,
      },
      {
        input: '[3, 3], 6',
        expectedOutput: '[0, 1]',
        isHidden: false,
      },
      {
        input: '[1, 5, 8, 12, 19], 20',
        expectedOutput: '[0, 4]',
        isHidden: true,
      },
      {
        input: '[-3, 4, 3, 90], 0',
        expectedOutput: '[0, 2]',
        isHidden: true,
      },
    ],
  },

  // =========================================================================
  // 2. TWO POINTERS (Pattern: Opposite Direction Pointers)
  // =========================================================================
  {
    id: 'dsa-2-valid-palindrome',
    title: 'Valid Palindrome',
    category: 'Two Pointers',
    pattern: 'Opposite Direction Pointers',
    difficulty: 'Easy',
    statement:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters. An empty string reads the same forward and backward.',
      },
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    supportedLanguages: ['python', 'javascript', 'java', 'c', 'cpp'],
    starterCode: {
      python: `def is_palindrome(s: str) -> bool:
    # Return True if s is a palindrome, False otherwise
    pass
`,
      javascript: `function isPalindrome(s) {
    // Return true if s is a palindrome, false otherwise
    return false;
}
`,
      java: `public class Main {
    public static boolean isPalindrome(String s) {
        // Return boolean
        return false;
    }
}
`,
      c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(const char* s) {
    return false;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    return false;
}
`,
      sql: `-- N/A`,
    },
    solutionCode: {
      python: `def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
`,
      javascript: `function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;
    const isAlnum = (ch) => /[a-z0-9]/i.test(ch);

    while (left < right) {
        while (left < right && !isAlnum(s[left])) left++;
        while (left < right && !isAlnum(s[right])) right--;
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
`,
      java: `public class Main {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
`,
      c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(const char* s) {
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) return false;
        left++; right--;
    }
    return true;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++; right--;
    }
    return true;
}
`,
      sql: `-- N/A`,
    },
    solution: {
      approach:
        'Use two pointers starting at both ends of the string. Skip non-alphanumeric characters in-place without allocating a filtered duplicate string. Compare characters case-insensitively and move inward until pointers cross.',
      intuition:
        'Symmetry requires that outermost valid characters match, followed by the next inner characters.',
      timeComplexity: 'O(n)',
      timeExplanation: 'Both pointers traverse each character at most once.',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant extra auxiliary pointers used in-place.',
      keyTakeaways: [
        'Avoid creating a temporary cleaned string to save O(n) memory.',
        'Remember to guard inner while-loops with left < right when skipping characters.',
      ],
    },
    testCases: [
      {
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '"race a car"',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        input: '" "',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '"0P"',
        expectedOutput: 'false',
        isHidden: true,
      },
      {
        input: '"ab_a"',
        expectedOutput: 'true',
        isHidden: true,
      },
    ],
  },

  // =========================================================================
  // 3. SLIDING WINDOW (Pattern: Dynamic Sliding Window / One-Pass Min Tracking)
  // =========================================================================
  {
    id: 'dsa-3-best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    category: 'Sliding Window',
    pattern: 'Dynamic Sliding Window / One-Pass Min Tracking',
    difficulty: 'Easy',
    statement:
      'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.',
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    supportedLanguages: ['python', 'javascript', 'java', 'c', 'cpp'],
    starterCode: {
      python: `def max_profit(prices):
    # Return integer representing maximum profit
    return 0
`,
      javascript: `function maxProfit(prices) {
    // Return maximum profit
    return 0;
}
`,
      java: `public class Main {
    public static int maxProfit(int[] prices) {
        return 0;
    }
}
`,
      c: `#include <stdio.h>

int maxProfit(int* prices, int pricesSize) {
    return 0;
}
`,
      cpp: `#include <vector>
using namespace std;

int maxProfit(vector<int>& prices) {
    return 0;
}
`,
      sql: `-- N/A`,
    },
    solutionCode: {
      python: `def max_profit(prices):
    min_price = float('inf')
    max_p = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_p:
            max_p = price - min_price
    return max_p
`,
      javascript: `function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else if (prices[i] - minPrice > maxProfit) {
            maxProfit = prices[i] - minPrice;
        }
    }
    return maxProfit;
}
`,
      java: `public class Main {
    public static int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) {
                minPrice = p;
            } else if (p - minPrice > maxProfit) {
                maxProfit = p - minPrice;
            }
        }
        return maxProfit;
    }
}
`,
      c: `#include <stdio.h>

int maxProfit(int* prices, int pricesSize) {
    int min_price = 1000000000;
    int max_p = 0;
    for (int i = 0; i < pricesSize; i++) {
        if (prices[i] < min_price) {
            min_price = prices[i];
        } else if (prices[i] - min_price > max_p) {
            max_p = prices[i] - min_price;
        }
    }
    return max_p;
}
`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int maxProfit(vector<int>& prices) {
    int minPrice = 1e9;
    int maxProfit = 0;
    for (int p : prices) {
        if (p < minPrice) minPrice = p;
        else maxProfit = max(maxProfit, p - minPrice);
    }
    return maxProfit;
}
`,
      sql: `-- N/A`,
    },
    solution: {
      approach:
        'Track the minimum buying price seen so far. At each step, evaluate selling at today\'s price: profit = prices[i] - min_price. Update the global maximum profit if this trade is higher.',
      intuition:
        'To maximize profit at any day i, you should have bought at the cheapest day among 0 through i-1.',
      timeComplexity: 'O(n)',
      timeExplanation: 'Single linear traversal over the prices array.',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Only two variables (min_price and max_profit) are maintained.',
      keyTakeaways: [
        'Recognize when an optimal subarray or sequence problem reduces to tracking running minimums/maximums.',
        'Avoid nested loops (O(n²)) by processing sequentially in time.',
      ],
    },
    testCases: [
      {
        input: '[7, 1, 5, 3, 6, 4]',
        expectedOutput: '5',
        isHidden: false,
      },
      {
        input: '[7, 6, 4, 3, 1]',
        expectedOutput: '0',
        isHidden: false,
      },
      {
        input: '[2, 4, 1]',
        expectedOutput: '2',
        isHidden: false,
      },
      {
        input: '[1, 2]',
        expectedOutput: '1',
        isHidden: true,
      },
      {
        input: '[3, 3, 5, 0, 0, 3, 1, 4]',
        expectedOutput: '4',
        isHidden: true,
      },
    ],
  },

  // =========================================================================
  // 4. STACK (Pattern: LIFO Bracket Matching)
  // =========================================================================
  {
    id: 'dsa-4-valid-parentheses',
    title: 'Valid Parentheses',
    category: 'Stack',
    pattern: 'LIFO Bracket Matching',
    difficulty: 'Easy',
    statement:
      'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "([])"',
        output: 'true',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}"',
    ],
    supportedLanguages: ['python', 'javascript', 'java', 'c', 'cpp'],
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    # Return True if parentheses match in LIFO order
    return False
`,
      javascript: `function isValid(s) {
    // Return true or false
    return false;
}
`,
      java: `public class Main {
    public static boolean isValid(String s) {
        return false;
    }
}
`,
      c: `#include <stdbool.h>

bool isValid(const char* s) {
    return false;
}
`,
      cpp: `#include <string>
using namespace std;

bool isValid(string s) {
    return false;
}
`,
      sql: `-- N/A`,
    },
    solutionCode: {
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack
`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            const top = stack.length > 0 ? stack.pop() : '#';
            if (map[char] !== top) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}
`,
      c: `#include <stdbool.h>
#include <string.h>

bool isValid(const char* s) {
    char stack[10005];
    int top = -1;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) return false;
            char last = stack[top--];
            if (c == ')' && last != '(') return false;
            if (c == '}' && last != '{') return false;
            if (c == ']' && last != '[') return false;
        }
    }
    return top == -1;
}
`,
      cpp: `#include <string>
#include <stack>
using namespace std;

bool isValid(string s) {
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
}
`,
      sql: `-- N/A`,
    },
    solution: {
      approach:
        'Use a stack to track open brackets. When an opening bracket is seen, push its expected closing partner (or the opening bracket itself). When a closing bracket is encountered, ensure the stack is non-empty and the popped element matches.',
      intuition:
        'The last bracket opened must be the first one closed (Last-In, First-Out).',
      timeComplexity: 'O(n)',
      timeExplanation: 'Traverse the string of length n once with O(1) push and pop operations.',
      spaceComplexity: 'O(n)',
      spaceExplanation: 'In the worst case (e.g. "((((("), all characters are pushed to the stack.',
      keyTakeaways: [
        'A stack is the quintessential data structure for hierarchical and nested balance problems.',
        'Ensure the stack is checked for emptiness before popping, and confirm the stack is completely empty at the end.',
      ],
    },
    testCases: [
      {
        input: '"()"',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '"()[]{}"',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '"(]"',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        input: '"([)]"',
        expectedOutput: 'false',
        isHidden: true,
      },
      {
        input: '"{[]}"',
        expectedOutput: 'true',
        isHidden: true,
      },
    ],
  },

  // =========================================================================
  // 5. BINARY SEARCH (Pattern: Search Space Bisection)
  // =========================================================================
  {
    id: 'dsa-5-binary-search',
    title: 'Binary Search in Sorted Array',
    category: 'Binary Search',
    pattern: 'Search Space Bisection',
    difficulty: 'Easy',
    statement:
      'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
    examples: [
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    supportedLanguages: ['python', 'javascript', 'java', 'c', 'cpp'],
    starterCode: {
      python: `def search(nums, target):
    # Return index of target in sorted nums, or -1
    return -1
`,
      javascript: `function search(nums, target) {
    // Return index or -1
    return -1;
}
`,
      java: `public class Main {
    public static int search(int[] nums, int target) {
        return -1;
    }
}
`,
      c: `#include <stdio.h>

int search(int* nums, int numsSize, int target) {
    return -1;
}
`,
      cpp: `#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    return -1;
}
`,
      sql: `-- N/A`,
    },
    solutionCode: {
      python: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`,
      javascript: `function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
`,
      java: `public class Main {
    public static int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
`,
      c: `#include <stdio.h>

int search(int* nums, int numsSize, int target) {
    int left = 0, right = numsSize - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
`,
      cpp: `#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    int left = 0, right = (int)nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
`,
      sql: `-- N/A`,
    },
    solution: {
      approach:
        'Maintain pointers left and right spanning the active search space. Compute mid = left + (right - left) // 2. If nums[mid] equals target, return mid. If nums[mid] < target, discard the left half. If nums[mid] > target, discard the right half. Repeat until target is found or left > right.',
      intuition:
        'Because the array is sorted, comparing target with the middle element immediately eliminates 50% of remaining candidates in every step.',
      timeComplexity: 'O(log n)',
      timeExplanation: 'The search space halves at every iteration: n -> n/2 -> n/4 -> ... -> 1 in log₂(n) steps.',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant additional memory for pointer indices.',
      keyTakeaways: [
        'Use mid = left + (right - left) // 2 to prevent integer overflow in languages with fixed integer sizes (Java, C, C++).',
        'Pay close attention to loop condition: while left <= right ensures single-element intervals are also evaluated.',
      ],
    },
    testCases: [
      {
        input: '[-1, 0, 3, 5, 9, 12], 9',
        expectedOutput: '4',
        isHidden: false,
      },
      {
        input: '[-1, 0, 3, 5, 9, 12], 2',
        expectedOutput: '-1',
        isHidden: false,
      },
      {
        input: '[5], 5',
        expectedOutput: '0',
        isHidden: false,
      },
      {
        input: '[2, 5], 5',
        expectedOutput: '1',
        isHidden: true,
      },
      {
        input: '[-100, -50, 0, 50, 100], -50',
        expectedOutput: '1',
        isHidden: true,
      },
    ],
  },
];
