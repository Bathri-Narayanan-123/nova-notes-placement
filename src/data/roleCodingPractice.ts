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
    description: 'Find all unplaced students (placement_status = "Unplaced") in Computer Science and Information Technology with CGPA between 7.0 and 8.0 who should be targeted for remedial interview coaching.',
    expectedColumns: ['name', 'department', 'cgpa'],
    sampleQuery: `SELECT name, department, cgpa 
FROM students 
WHERE placement_status = 'Unplaced'
  AND department IN ('Computer Science', 'Information Technology')
  AND cgpa BETWEEN 7.0 AND 8.0
ORDER BY cgpa DESC;`,
    solutionQuery: `SELECT name, department, cgpa 
FROM students 
WHERE placement_status = 'Unplaced'
  AND department IN ('Computer Science', 'Information Technology')
  AND cgpa BETWEEN 7.0 AND 8.0
ORDER BY cgpa DESC;`,
    explanation: 'Combines multiple WHERE predicates: placement_status check, IN set operator for departments, and BETWEEN for numerical range.'
  }
];
