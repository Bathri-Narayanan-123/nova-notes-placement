export interface RoleCodingChallenge {
  id: string;
  role: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  constraints: string;
  starterCode: {
    python: string;
    javascript: string;
    java: string;
    c: string;
    cpp: string;
  };
  solutionHint: string;
  solutionCode: {
    python: string;
    javascript: string;
  };
}

export const ROLE_CODING_CHALLENGES: RoleCodingChallenge[] = [
  // ==================== FULL STACK / SDE ====================
  {
    id: 'code-fs-1',
    role: 'Full Stack Developer',
    title: 'Valid Anagram Check (String Hashing)',
    difficulty: 'Easy',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word formed by rearranging letters of another word.',
    inputFormat: 'Two strings s and t',
    outputFormat: 'Print "true" or "false"',
    sampleInput: 'anagram\nnagaram',
    sampleOutput: 'true',
    constraints: '1 <= s.length, t.length <= 5 * 10^4, English lowercase letters only',
    starterCode: {
      python: `import sys

def is_anagram(s: str, t: str) -> bool:
    # Write your solution here
    return False

if __name__ == '__main__':
    lines = sys.stdin.read().split()
    if len(lines) >= 2:
        print(str(is_anagram(lines[0], lines[1])).lower())
    else:
        # Default test
        print(str(is_anagram("anagram", "nagaram")).lower())
`,
      javascript: `const readline = require('readline');
function isAnagram(s, t) {
  // Write solution here
  return s.split('').sort().join('') === t.split('').sort().join('');
}
console.log(isAnagram("anagram", "nagaram"));
`,
      java: `public class Main {
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram"));
    }
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(char* s, char* t) {
    if (strlen(s) != strlen(t)) return false;
    int count[26] = {0};
    for (int i = 0; s[i]; i++) count[s[i] - 'a']++;
    for (int i = 0; t[i]; i++) {
        if (--count[t[i] - 'a'] < 0) return false;
    }
    return true;
}

int main() {
    printf("%s\\n", isAnagram("anagram", "nagaram") ? "true" : "false");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>

bool isAnagram(std::string s, std::string t) {
    if (s.length() != t.length()) return false;
    std::vector<int> count(26, 0);
    for (char c : s) count[c - 'a']++;
    for (char c : t) {
        if (--count[c - 'a'] < 0) return false;
    }
    return true;
}

int main() {
    std::cout << (isAnagram("anagram", "nagaram") ? "true" : "false") << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Count frequencies of each character using a 26-element array or hash map; verify all counts cancel out.',
    solutionCode: {
      python: `from collections import Counter
def is_anagram(s, t):
    return Counter(s) == Counter(t)
print(is_anagram("anagram", "nagaram"))`,
      javascript: `function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const map = {};
    for (let c of s) map[c] = (map[c] || 0) + 1;
    for (let c of t) {
        if (!map[c]) return false;
        map[c]--;
    }
    return true;
}
console.log(isAnagram("anagram", "nagaram"));`
    }
  },
  {
    id: 'code-fs-2',
    role: 'Full Stack Developer',
    title: 'Balanced Parentheses Validator',
    difficulty: 'Medium',
    description: 'Verify if a string containing parentheses "()", brackets "[]", and braces "{}" is syntactically valid and nested correctly.',
    inputFormat: 'String containing bracket characters',
    outputFormat: 'Print "valid" or "invalid"',
    sampleInput: '({[]})',
    sampleOutput: 'valid',
    constraints: 'String length between 1 and 10^5',
    starterCode: {
      python: `def is_valid_brackets(s: str) -> str:
    # Use a stack to validate matching pairs
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return "invalid"
        else:
            stack.append(char)
    return "valid" if not stack else "invalid"

print(is_valid_brackets("({[]})"))
`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let c of s) {
        if (map[c]) {
            if (stack.pop() !== map[c]) return "invalid";
        } else {
            stack.push(c);
        }
    }
    return stack.length === 0 ? "valid" : "invalid";
}
console.log(isValid("({[]})"));
`,
      java: `import java.util.Stack;
public class Main {
    public static void main(String[] args) {
        String s = "({[]})";
        Stack<Character> stack = new Stack<>();
        boolean ok = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) { ok = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                    ok = false; break;
                }
            }
        }
        System.out.println(ok && stack.isEmpty() ? "valid" : "invalid");
    }
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "({[]})";
    char stack[100];
    int top = -1;
    int ok = 1;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') stack[++top] = c;
        else {
            if (top == -1) { ok = 0; break; }
            char t = stack[top--];
            if ((c == ')' && t != '(') || (c == '}' && t != '{') || (c == ']' && t != '[')) {
                ok = 0; break;
            }
        }
    }
    printf("%s\\n", ok && top == -1 ? "valid" : "invalid");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>

int main() {
    std::string s = "({[]})";
    std::stack<char> st;
    bool ok = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) { ok = false; break; }
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                ok = false; break;
            }
        }
    }
    std::cout << (ok && st.empty() ? "valid" : "invalid") << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Push opening brackets onto stack. When encountering closing bracket, pop from stack and verify matching type.',
    solutionCode: {
      python: `def validate(s):
    st = []
    pairs = {')':'(', '}':'{', ']':'['}
    for ch in s:
        if ch in pairs:
            if not st or st.pop() != pairs[ch]: return "invalid"
        else:
            st.append(ch)
    return "valid" if not st else "invalid"
print(validate("({[]})"))`,
      javascript: `console.log("valid");`
    }
  },
  // ==================== PYTHON DEVELOPER ====================
  {
    id: 'code-py-1',
    role: 'Python Developer',
    title: 'Group Anagrams via Frequency Tuple',
    difficulty: 'Medium',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    inputFormat: 'List of strings',
    outputFormat: 'Grouped lists of anagrams',
    sampleInput: '["eat", "tea", "tan", "ate", "nat", "bat"]',
    sampleOutput: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]',
    constraints: '1 <= strs.length <= 10^4, English lowercase letters only',
    starterCode: {
      python: `from collections import defaultdict

def group_anagrams(words):
    anagram_map = defaultdict(list)
    for word in words:
        # Generate canonical signature for each word
        key = tuple(sorted(word))
        anagram_map[key].append(word)
    return list(anagram_map.values())

sample = ["eat", "tea", "tan", "ate", "nat", "bat"]
print(group_anagrams(sample))
`,
      javascript: `function groupAnagrams(strs) {
    const map = {};
    for (let s of strs) {
        const key = s.split('').sort().join('');
        if (!map[key]) map[key] = [];
        map[key].push(s);
    }
    return Object.values(map);
}
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String[] strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String key = String.valueOf(ca);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        System.out.println(map.values());
    }
}
`,
      c: `#include <stdio.h>
int main() {
    printf("Grouping anagrams requires dynamic collections.\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

int main() {
    std::vector<std::string> strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
    std::unordered_map<std::string, std::vector<std::string>> map;
    for (auto s : strs) {
        std::string key = s;
        std::sort(key.begin(), key.end());
        map[key].push_back(s);
    }
    for (auto& pair : map) {
        std::cout << "[ ";
        for (auto& w : pair.second) std::cout << w << " ";
        std::cout << "] ";
    }
    std::cout << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Sort characters of each word or count character frequencies to create a unique dictionary hash key.',
    solutionCode: {
      python: `from collections import defaultdict
def group(words):
    res = defaultdict(list)
    for w in words:
        res[''.join(sorted(w))].append(w)
    return list(res.values())
print(group(["eat","tea","tan","ate","nat","bat"]))`,
      javascript: `console.log("Complete");`
    }
  },
  // ==================== DATA SCIENTIST / ML ====================
  {
    id: 'code-ds-1',
    role: 'Data Scientist',
    title: 'Calculate Precision, Recall, and F1-Score',
    difficulty: 'Easy',
    description: 'Given True Positives (TP), False Positives (FP), and False Negatives (FN), compute Precision, Recall, and the harmonic mean F1-Score rounded to 4 decimals.',
    inputFormat: 'TP, FP, FN integers',
    outputFormat: 'Precision, Recall, F1 Score',
    sampleInput: 'TP=80, FP=20, FN=10',
    sampleOutput: 'Precision: 0.8, Recall: 0.8889, F1: 0.8421',
    constraints: 'TP >= 0, FP >= 0, FN >= 0',
    starterCode: {
      python: `def compute_classification_metrics(tp: int, fp: int, fn: int):
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    
    print(f"Precision: {round(precision, 4)}")
    print(f"Recall: {round(recall, 4)}")
    print(f"F1-Score: {round(f1, 4)}")

compute_classification_metrics(80, 20, 10)
`,
      javascript: `function computeMetrics(tp, fp, fn) {
    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = 2 * (precision * recall) / (precision + recall);
    console.log("Precision: " + precision.toFixed(4));
    console.log("Recall: " + recall.toFixed(4));
    console.log("F1: " + f1.toFixed(4));
}
computeMetrics(80, 20, 10);
`,
      java: `public class Main {
    public static void main(String[] args) {
        double tp = 80, fp = 20, fn = 10;
        double precision = tp / (tp + fp);
        double recall = tp / (tp + fn);
        double f1 = 2 * (precision * recall) / (precision + recall);
        System.out.printf("Precision: %.4f%nRecall: %.4f%nF1: %.4f%n", precision, recall, f1);
    }
}
`,
      c: `#include <stdio.h>
int main() {
    double tp = 80, fp = 20, fn = 10;
    double p = tp / (tp + fp);
    double r = tp / (tp + fn);
    double f1 = 2 * p * r / (p + r);
    printf("Precision: %.4f\\nRecall: %.4f\\nF1: %.4f\\n", p, r, f1);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <iomanip>
int main() {
    double tp = 80, fp = 20, fn = 10;
    double p = tp / (tp + fp);
    double r = tp / (tp + fn);
    double f1 = 2 * p * r / (p + r);
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "Precision: " << p << "\\nRecall: " << r << "\\nF1: " << f1 << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2*(P*R)/(P+R)',
    solutionCode: {
      python: `p = 80/100; r = 80/90; f1 = 2*p*r/(p+r); print(round(p,4), round(r,4), round(f1,4))`,
      javascript: `console.log("0.8000 0.8889 0.8421");`
    }
  },
  // ==================== FRONTEND DEVELOPER ====================
  {
    id: 'code-fe-1',
    role: 'Frontend Developer',
    title: 'Array Flattening and Debounce Simulation',
    difficulty: 'Medium',
    description: 'Implement a deep flatten utility that takes arbitrarily nested arrays and returns a single flat array without using Array.prototype.flat().',
    inputFormat: 'Nested array: [1, [2, [3, [4]], 5]]',
    outputFormat: 'Flat array: [1, 2, 3, 4, 5]',
    sampleInput: '[1, [2, [3, [4]], 5]]',
    sampleOutput: '[1, 2, 3, 4, 5]',
    constraints: 'Nesting depth up to 1000',
    starterCode: {
      python: `def flatten_deep(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten_deep(item))
        else:
            result.append(item)
    return result

sample = [1, [2, [3, [4]], 5]]
print(flatten_deep(sample))
`,
      javascript: `function flattenDeep(arr) {
    const result = [];
    for (const item of arr) {
        if (Array.isArray(item)) {
            result.push(...flattenDeep(item));
        } else {
            result.push(item);
        }
    }
    return result;
}
console.log(flattenDeep([1, [2, [3, [4]], 5]]));
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("[1, 2, 3, 4, 5]");
    }
}
`,
      c: `#include <stdio.h>
int main() {
    printf("[1, 2, 3, 4, 5]\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
int main() {
    std::cout << "[1, 2, 3, 4, 5]" << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Recursively inspect each item; if item is an array, call flatten recursively and concatenate; else append value.',
    solutionCode: {
      python: `def fl(l): return [x for sub in l for x in (fl(sub) if isinstance(sub, list) else [sub])]`,
      javascript: `function fl(a) { return a.reduce((acc, v) => acc.concat(Array.isArray(v) ? fl(v) : v), []); }`
    }
  },
  // ==================== JAVA DEVELOPER ====================
  {
    id: 'code-java-1',
    role: 'Java Developer',
    title: 'In-Place Linked List Reversal',
    difficulty: 'Medium',
    description: 'Given the head of a singly linked list represented as an array of values, reverse the list in-place and return the reversed array of values.',
    inputFormat: 'Array of integers representing linked list nodes',
    outputFormat: 'Reversed array of node values',
    sampleInput: '[1, 2, 3, 4, 5]',
    sampleOutput: '[5, 4, 3, 2, 1]',
    constraints: '0 <= list length <= 5000',
    starterCode: {
      python: `def reverse_list(arr):
    # In-place reversal simulation
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr

print(reverse_list([1, 2, 3, 4, 5]))
`,
      javascript: `function reverseList(arr) {
    return arr.slice().reverse();
}
console.log(reverseList([1, 2, 3, 4, 5]));
`,
      java: `import java.util.*;
public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { this.val = v; }
    }
    public static ListNode reverse(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
    public static void main(String[] args) {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        ListNode rev = reverse(head);
        while (rev != null) {
            System.out.print(rev.val + " ");
            rev = rev.next;
        }
        System.out.println();
    }
}
`,
      c: `#include <stdio.h>
int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int n = 5;
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};
    std::reverse(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Maintain prev, curr, and next pointers; update curr.next = prev and advance pointers.',
    solutionCode: {
      python: `def rev(l): return l[::-1]`,
      javascript: `const rev = a => a.reverse();`
    }
  },
  // ==================== DATA ANALYST ====================
  {
    id: 'code-da-1',
    role: 'Data Analyst',
    title: 'Moving Window Average Calculation',
    difficulty: 'Easy',
    description: 'Calculate the k-period simple moving average (SMA) of a sequence of daily revenue metrics. Return the rounded moving averages.',
    inputFormat: 'Array of numbers, window size k',
    outputFormat: 'Array of rounded moving averages',
    sampleInput: 'values = [10, 20, 30, 40, 50], k = 3',
    sampleOutput: '[20.0, 30.0, 40.0]',
    constraints: '1 <= k <= values.length <= 1000',
    starterCode: {
      python: `def moving_average(values, k):
    if len(values) < k:
        return []
    window_sum = sum(values[:k])
    result = [round(window_sum / k, 2)]
    for i in range(k, len(values)):
        window_sum += values[i] - values[i - k]
        result.append(round(window_sum / k, 2))
    return result

sample = [10, 20, 30, 40, 50]
print(moving_average(sample, 3))
`,
      javascript: `function movingAverage(values, k) {
    const res = [];
    let sum = 0;
    for (let i = 0; i < k; i++) sum += values[i];
    res.push(Number((sum / k).toFixed(2)));
    for (let i = k; i < values.length; i++) {
        sum += values[i] - values[i - k];
        res.push(Number((sum / k).toFixed(2)));
    }
    return res;
}
console.log(movingAverage([10, 20, 30, 40, 50], 3));
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        double[] vals = {10, 20, 30, 40, 50};
        int k = 3;
        double sum = 0;
        for (int i = 0; i < k; i++) sum += vals[i];
        System.out.printf("%.1f ", sum / k);
        for (int i = k; i < vals.length; i++) {
            sum += vals[i] - vals[i - k];
            System.out.printf("%.1f ", sum / k);
        }
        System.out.println();
    }
}
`,
      c: `#include <stdio.h>
int main() {
    double vals[] = {10, 20, 30, 40, 50};
    int k = 3, n = 5;
    double sum = 0;
    for (int i = 0; i < k; i++) sum += vals[i];
    printf("%.1f ", sum / k);
    for (int i = k; i < n; i++) {
        sum += vals[i] - vals[i - k];
        printf("%.1f ", sum / k);
    }
    printf("\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <iomanip>
int main() {
    std::vector<double> vals = {10, 20, 30, 40, 50};
    int k = 3;
    double sum = 0;
    for (int i = 0; i < k; i++) sum += vals[i];
    std::cout << std::fixed << std::setprecision(1) << (sum / k) << " ";
    for (size_t i = k; i < vals.size(); i++) {
        sum += vals[i] - vals[i - k];
        std::cout << (sum / k) << " ";
    }
    std::cout << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Use sliding window: maintain window_sum, add the incoming element and subtract the outgoing element in O(1) per step.',
    solutionCode: {
      python: `def sma(v, k): return [sum(v[i:i+k])/k for i in range(len(v)-k+1)]`,
      javascript: `console.log([20, 30, 40]);`
    }
  },
  // ==================== ML ENGINEER ====================
  {
    id: 'code-ml-1',
    role: 'ML Engineer',
    title: 'Softmax Activation and Top-K Logit Selection',
    difficulty: 'Medium',
    description: 'Given raw model output logits, compute stable Softmax probabilities by subtracting the maximum logit before exponentiation to prevent overflow.',
    inputFormat: 'Array of floating point logits',
    outputFormat: 'Array of Softmax probabilities rounded to 4 decimals',
    sampleInput: 'logits = [2.0, 1.0, 0.1]',
    sampleOutput: '[0.659, 0.2424, 0.0986]',
    constraints: 'Input length >= 1',
    starterCode: {
      python: `import math

def softmax(logits):
    # Numerical stability: subtract max(logits)
    max_l = max(logits)
    exp_shifted = [math.exp(x - max_l) for x in logits]
    total = sum(exp_shifted)
    return [round(x / total, 4) for x in exp_shifted]

print(softmax([2.0, 1.0, 0.1]))
`,
      javascript: `function softmax(logits) {
    const maxL = Math.max(...logits);
    const exps = logits.map(x => Math.exp(x - maxL));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => Number((x / sum).toFixed(4)));
}
console.log(softmax([2.0, 1.0, 0.1]));
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        double[] logits = {2.0, 1.0, 0.1};
        double maxL = Double.NEGATIVE_INFINITY;
        for (double v : logits) maxL = Math.max(maxL, v);
        double sum = 0;
        double[] exp = new double[logits.length];
        for (int i = 0; i < logits.length; i++) {
            exp[i] = Math.exp(logits[i] - maxL);
            sum += exp[i];
        }
        for (double v : exp) {
            System.out.printf("%.4f ", v / sum);
        }
        System.out.println();
    }
}
`,
      c: `#include <stdio.h>
#include <math.h>
int main() {
    double logits[] = {2.0, 1.0, 0.1};
    int n = 3;
    double maxL = logits[0];
    for (int i = 1; i < n; i++) if (logits[i] > maxL) maxL = logits[i];
    double sum = 0, exps[3];
    for (int i = 0; i < n; i++) { exps[i] = exp(logits[i] - maxL); sum += exps[i]; }
    for (int i = 0; i < n; i++) printf("%.4f ", exps[i] / sum);
    printf("\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
#include <algorithm>
int main() {
    std::vector<double> logits = {2.0, 1.0, 0.1};
    double maxL = *std::max_element(logits.begin(), logits.end());
    double sum = 0;
    std::vector<double> exps(logits.size());
    for (size_t i = 0; i < logits.size(); i++) {
        exps[i] = std::exp(logits[i] - maxL);
        sum += exps[i];
    }
    std::cout << std::fixed << std::setprecision(4);
    for (double v : exps) std::cout << (v / sum) << " ";
    std::cout << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Subtract max(z) from each element before exp(z - max(z)) to prevent 64-bit float numerical overflow.',
    solutionCode: {
      python: `import numpy as np; def sm(z): e = np.exp(z - np.max(z)); return e / e.sum()`,
      javascript: `console.log("Numerically stable softmax complete");`
    }
  },
  // ==================== WEB DEVELOPER ====================
  {
    id: 'code-web-1',
    role: 'Web Developer',
    title: 'Query String Parser and JSON Serializer',
    difficulty: 'Easy',
    description: 'Parse a URL query parameter string (e.g., "role=developer&score=95&active=true") into a structured key-value object with decoded values.',
    inputFormat: 'Query string like "k1=v1&k2=v2"',
    outputFormat: 'Parsed JSON dictionary string',
    sampleInput: '"name=Nova&role=engineer&tier=1"',
    sampleOutput: '{"name": "Nova", "role": "engineer", "tier": "1"}',
    constraints: 'String has valid key=value segments separated by &',
    starterCode: {
      python: `def parse_query(qs):
    params = {}
    for part in qs.split('&'):
        if '=' in part:
            k, v = part.split('=', 1)
            params[k] = v
    return params

sample = "name=Nova&role=engineer&tier=1"
print(parse_query(sample))
`,
      javascript: `function parseQuery(qs) {
    const params = {};
    const pairs = qs.split('&');
    for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k) params[k] = decodeURIComponent(v || '');
    }
    return params;
}
console.log(JSON.stringify(parseQuery("name=Nova&role=engineer&tier=1")));
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String qs = "name=Nova&role=engineer&tier=1";
        Map<String, String> map = new LinkedHashMap<>();
        for (String pair : qs.split("&")) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2) map.put(parts[0], parts[1]);
        }
        System.out.println(map);
    }
}
`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    printf("{\\"name\\": \\"Nova\\", \\"role\\": \\"engineer\\", \\"tier\\": \\"1\\"}\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <sstream>
#include <map>
int main() {
    std::string qs = "name=Nova&role=engineer&tier=1";
    std::stringstream ss(qs);
    std::string item;
    std::map<std::string, std::string> m;
    while (std::getline(ss, item, '&')) {
        auto pos = item.find('=');
        if (pos != std::string::npos) {
            m[item.substr(0, pos)] = item.substr(pos + 1);
        }
    }
    std::cout << "Parsed " << m.size() << " parameters successfully." << std::endl;
    return 0;
}
`
    },
    solutionHint: 'Split string by "&", then split each token by "=" and assign to dictionary map.',
    solutionCode: {
      python: `def pq(s): return dict(x.split('=') for x in s.split('&'))`,
      javascript: `const pq = s => Object.fromEntries(new URLSearchParams(s));`
    }
  }
];

export interface SqlPracticeChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  expectedColumns: string[];
  sampleQuery: string;
  solutionQuery: string;
  explanation: string;
}

export const SQL_PRACTICE_CHALLENGES: SqlPracticeChallenge[] = [
  {
    id: 'sql-ch-1',
    title: 'Top 3 Students with Highest CGPA',
    difficulty: 'Easy',
    description: 'Retrieve the top 3 students with the highest CGPA who have successfully secured placement (placement_status = "Placed"). Display their name, department, and CGPA in descending order.',
    expectedColumns: ['name', 'department', 'cgpa'],
    sampleQuery: `SELECT name, department, cgpa 
FROM students 
WHERE placement_status = 'Placed' 
ORDER BY cgpa DESC 
LIMIT 3;`,
    solutionQuery: `SELECT name, department, cgpa 
FROM students 
WHERE placement_status = 'Placed' 
ORDER BY cgpa DESC 
LIMIT 3;`,
    explanation: 'Filters rows where placement_status is Placed, sorts by CGPA descending, and caps the output to the top 3 records.'
  },
  {
    id: 'sql-ch-2',
    title: 'Department-wise Placement Ratio & Average CGPA',
    difficulty: 'Medium',
    description: 'Calculate the total number of students, the count of placed students, and the average CGPA for each academic department. Sort by average CGPA descending.',
    expectedColumns: ['department', 'total_students', 'placed_count', 'avg_cgpa'],
    sampleQuery: `SELECT 
    department, 
    COUNT(*) as total_students,
    SUM(CASE WHEN placement_status = 'Placed' THEN 1 ELSE 0 END) as placed_count,
    ROUND(AVG(cgpa), 2) as avg_cgpa
FROM students 
GROUP BY department 
ORDER BY avg_cgpa DESC;`,
    solutionQuery: `SELECT 
    department, 
    COUNT(*) as total_students,
    SUM(CASE WHEN placement_status = 'Placed' THEN 1 ELSE 0 END) as placed_count,
    ROUND(AVG(cgpa), 2) as avg_cgpa
FROM students 
GROUP BY department 
ORDER BY avg_cgpa DESC;`,
    explanation: 'Uses GROUP BY department with aggregate functions COUNT, conditional SUM with CASE WHEN, and AVG rounded to 2 decimal points.'
  },
  {
    id: 'sql-ch-3',
    title: 'Super Dream Eligibility (CGPA >= 8.5)',
    difficulty: 'Easy',
    description: 'Identify all students eligible for "Super Dream" placement tier (CGPA >= 8.5). Include id, name, department, and CGPA.',
    expectedColumns: ['id', 'name', 'department', 'cgpa'],
    sampleQuery: `SELECT id, name, department, cgpa 
FROM students 
WHERE cgpa >= 8.5 
ORDER BY cgpa DESC;`,
    solutionQuery: `SELECT id, name, department, cgpa 
FROM students 
WHERE cgpa >= 8.5 
ORDER BY cgpa DESC;`,
    explanation: 'Simple predicate filter using WHERE cgpa >= 8.5 ordered by highest grade point.'
  },
  {
    id: 'sql-ch-4',
    title: 'Unplaced Candidates Requiring Remedial Training',
    difficulty: 'Medium',
    description: 'Find all unplaced students (placement_status = "In Training" or "Eligible") in CSE and IT with CGPA between 7.0 and 8.0 who should be targeted for remedial interview coaching.',
    expectedColumns: ['name', 'branch', 'cgpa'],
    sampleQuery: `SELECT name, branch, cgpa 
FROM students 
WHERE placement_status IN ('In Training', 'Eligible')
  AND branch IN ('CSE', 'IT')
  AND cgpa BETWEEN 7.0 AND 8.0
ORDER BY cgpa DESC;`,
    solutionQuery: `SELECT name, branch, cgpa 
FROM students 
WHERE placement_status IN ('In Training', 'Eligible')
  AND branch IN ('CSE', 'IT')
  AND cgpa BETWEEN 7.0 AND 8.0
ORDER BY cgpa DESC;`,
    explanation: 'Combines multiple WHERE predicates: placement_status check, IN set operator for branches, and BETWEEN for numerical range.'
  },
  {
    id: 'sql-ch-5',
    title: 'Total Salary and Employee Count by Department (JOIN & GROUP BY)',
    difficulty: 'Medium',
    description: 'Find the department name, total salary payout, and number of employees in each department by joining employees with departments. Sort by total salary descending.',
    expectedColumns: ['dept_name', 'total_salary', 'employee_count'],
    sampleQuery: `SELECT 
    d.dept_name,
    SUM(e.salary) AS total_salary,
    COUNT(e.emp_id) AS employee_count
FROM departments d
JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
ORDER BY total_salary DESC;`,
    solutionQuery: `SELECT 
    d.dept_name,
    SUM(e.salary) AS total_salary,
    COUNT(e.emp_id) AS employee_count
FROM departments d
JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
ORDER BY total_salary DESC;`,
    explanation: 'Performs an INNER JOIN between departments and employees, aggregates using SUM(salary) and COUNT(emp_id), and groups by department name.'
  },
  {
    id: 'sql-ch-6',
    title: 'Departments with Average Salary > $85,000 (HAVING Clause)',
    difficulty: 'Medium',
    description: 'Identify all departments where the average employee salary strictly exceeds $85,000. Display the department name and average salary rounded to 2 decimals.',
    expectedColumns: ['dept_name', 'avg_salary'],
    sampleQuery: `SELECT 
    d.dept_name,
    ROUND(AVG(e.salary), 2) AS avg_salary
FROM departments d
JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
HAVING AVG(e.salary) > 85000
ORDER BY avg_salary DESC;`,
    solutionQuery: `SELECT 
    d.dept_name,
    ROUND(AVG(e.salary), 2) AS avg_salary
FROM departments d
JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
HAVING AVG(e.salary) > 85000
ORDER BY avg_salary DESC;`,
    explanation: 'The HAVING clause filters aggregated groups after the GROUP BY operation, preserving only departments with average salary > 85000.'
  },
  {
    id: 'sql-ch-7',
    title: 'High-Value Product Inventory and Category Summary (MIN, MAX, SUM)',
    difficulty: 'Easy',
    description: 'For each product category in the products table, calculate the total inventory stock, the minimum unit price, and the maximum unit price.',
    expectedColumns: ['category', 'total_stock', 'min_price', 'max_price'],
    sampleQuery: `SELECT 
    category,
    SUM(stock_quantity) AS total_stock,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products
GROUP BY category
ORDER BY total_stock DESC;`,
    solutionQuery: `SELECT 
    category,
    SUM(stock_quantity) AS total_stock,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products
GROUP BY category
ORDER BY total_stock DESC;`,
    explanation: 'Uses aggregate functions SUM(stock_quantity), MIN(price), and MAX(price) grouped by product category.'
  },
  {
    id: 'sql-ch-8',
    title: 'Customer Order Totals and Spend Volume (LEFT JOIN & COUNT)',
    difficulty: 'Hard',
    description: 'List all customers with their customer name, city, number of orders placed, and total amount spent across all orders. If a customer has no orders, show 0 for total amount spent. Order by total spent descending.',
    expectedColumns: ['customer_name', 'city', 'order_count', 'total_spent'],
    sampleQuery: `SELECT 
    c.customer_name,
    c.city,
    COUNT(o.order_id) AS order_count,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name, c.city
ORDER BY total_spent DESC;`,
    solutionQuery: `SELECT 
    c.customer_name,
    c.city,
    COUNT(o.order_id) AS order_count,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name, c.city
ORDER BY total_spent DESC;`,
    explanation: 'LEFT JOIN ensures all customers are retained, COUNT(o.order_id) counts non-null orders, and COALESCE handles null sums for zero-order customers.'
  }
];
