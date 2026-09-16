import { Question } from '../types';

export interface AptitudeTopicItem {
  id: string;
  category: 'Quantitative' | 'Logical' | 'Verbal';
  subTopic: string;
  formulaHint?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string; explanation: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  stepByStepSolution: string[];
}

export type AptitudeQuestion = Question & {
  stepByStepSolution?: string[];
  formulaHint?: string;
  category?: string;
};

export const APTITUDE_QUESTION_BANK: AptitudeQuestion[] = [
  // ==================== QUANTITATIVE APTITUDE ====================
  {
    id: 'apt-quant-1',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Percentages',
    difficulty: 'Easy',
    question: 'A product’s price is increased by 20% and then subsequently discounted by 20%. What is the net percentage change in the price?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '0% (No change)', explanation: 'Incorrect: The 20% discount is applied to the increased price, which is larger than the original base.' },
      { key: 'B', text: '4% decrease', explanation: 'Correct: Let base price = 100. After 20% increase = 120. 20% discount on 120 = 24. Final price = 120 - 24 = 96, which is a 4% decrease.' },
      { key: 'C', text: '2% decrease', explanation: 'Incorrect: Using formula x + y + (xy/100): +20 - 20 - 400/100 = -4%.' },
      { key: 'D', text: '4% increase', explanation: 'Incorrect: The final price decreases because the discount base is higher than the original base.' },
    ],
    formulaHint: 'Net change formula: [x + y + (xy / 100)]%',
    stepByStepSolution: [
      'Assume the original price of the product is $100.',
      'After a 20% increase, the new price becomes: 100 + (0.20 × 100) = $120.',
      'Now, apply a 20% discount on the new price: 120 × 0.20 = $24.',
      'Final price after discount: 120 - 24 = $96.',
      'Net Change = ((96 - 100) / 100) × 100 = -4% (a 4% decrease).'
    ],
  },
  {
    id: 'apt-quant-2',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Time and Work',
    difficulty: 'Medium',
    question: 'Worker A can complete a software module in 12 days, and Worker B can complete the same module in 24 days. Working together, how many days will they take to complete the module?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '8 days', explanation: 'Correct: Work done per day = (1/12) + (1/24) = 3/24 = 1/8. Total days required = 8 days.' },
      { key: 'B', text: '6 days', explanation: 'Incorrect: 6 days would mean doing 1/6th per day, which is higher than their combined rate.' },
      { key: 'C', text: '18 days', explanation: 'Incorrect: Two workers working together always finish faster than the fastest individual (12 days).' },
      { key: 'D', text: '10 days', explanation: 'Incorrect: (12 × 24) / (12 + 24) = 288 / 36 = 8.' },
    ],
    formulaHint: 'Combined time: (A × B) / (A + B)',
    stepByStepSolution: [
      'A’s 1-day work rate = 1/12 of the total project.',
      'B’s 1-day work rate = 1/24 of the total project.',
      'Combined 1-day work rate = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 = 1/8.',
      'Therefore, time taken to complete the entire work together = 1 / (1/8) = 8 days.'
    ],
  },
  {
    id: 'apt-quant-3',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Time, Speed and Distance',
    difficulty: 'Medium',
    question: 'A train 150 meters long passes a telegraph pole in 9 seconds. What is the speed of the train in km/h?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '50 km/h', explanation: 'Incorrect: Speed in m/s is 150 / 9 = 16.67 m/s.' },
      { key: 'B', text: '54 km/h', explanation: 'Incorrect: 150/9 × 18/5 = 60 km/h.' },
      { key: 'C', text: '60 km/h', explanation: 'Correct: Speed in m/s = Distance / Time = 150 / 9 m/s. Convert to km/h by multiplying by (18/5): (150 / 9) × (18 / 5) = (150/5) × (18/9) = 30 × 2 = 60 km/h.' },
      { key: 'D', text: '64 km/h', explanation: 'Incorrect: Calculation error in conversion factor.' },
    ],
    formulaHint: 'Speed = Distance / Time; Multiply by (18/5) to convert m/s to km/h.',
    stepByStepSolution: [
      'Distance covered to cross pole = Length of train = 150 meters.',
      'Time taken = 9 seconds.',
      'Speed in m/s = 150 / 9 m/s.',
      'To convert m/s to km/h, multiply by 18/5: (150/9) × (18/5).',
      'Simplify: (150 / 5) × (18 / 9) = 30 × 2 = 60 km/h.'
    ],
  },
  {
    id: 'apt-quant-4',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Profit and Loss',
    difficulty: 'Medium',
    question: 'A merchant sells an item for $840 at a gain of 20%. What was the cost price of the item?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '$680', explanation: 'Incorrect: Cost price is $700; $680 would yield a larger gain than 20%.' },
      { key: 'B', text: '$700', explanation: 'Correct: Selling Price = Cost Price × 1.20. Therefore, CP = 840 / 1.20 = $700.' },
      { key: 'C', text: '$720', explanation: 'Incorrect: 720 × 1.20 = 864, not 840.' },
      { key: 'D', text: '$750', explanation: 'Incorrect: 750 × 1.20 = 900.' },
    ],
    formulaHint: 'Cost Price = Selling Price / (1 + Profit%/100)',
    stepByStepSolution: [
      'Selling Price (SP) = $840.',
      'Profit Percentage = 20%.',
      'SP = CP × (100 + Profit%) / 100 = CP × 1.20.',
      'CP = 840 / 1.20 = 8400 / 12 = $700.'
    ],
  },
  {
    id: 'apt-quant-5',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Ratios and Proportions',
    difficulty: 'Easy',
    question: 'The ratio of two numbers is 3:5. If each number is increased by 10, the new ratio becomes 5:7. What is the smaller number?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '15', explanation: 'Correct: Let numbers be 3x and 5x. (3x + 10) / (5x + 10) = 5/7 => 21x + 70 = 25x + 50 => 4x = 20 => x = 5. Smaller number = 3x = 15.' },
      { key: 'B', text: '25', explanation: 'Incorrect: 25 is the larger number (5 × 5 = 25).' },
      { key: 'C', text: '18', explanation: 'Incorrect: Check ratio: (18+10)/(30+10) = 28/40 = 7/10 != 5/7.' },
      { key: 'D', text: '12', explanation: 'Incorrect: Does not satisfy the ratio equation.' },
    ],
    formulaHint: 'Cross-multiply: 7(3x + 10) = 5(5x + 10)',
    stepByStepSolution: [
      'Let the original numbers be 3x and 5x.',
      'According to the given condition: (3x + 10) / (5x + 10) = 5 / 7.',
      'Cross-multiplying gives: 7(3x + 10) = 5(5x + 10).',
      '21x + 70 = 25x + 50.',
      '70 - 50 = 25x - 21x => 20 = 4x => x = 5.',
      'The smaller number is 3x = 3 × 5 = 15.'
    ],
  },
  {
    id: 'apt-quant-6',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Averages',
    difficulty: 'Easy',
    question: 'The average score of 5 test attempts is 72. If a 6th attempt score of 96 is added, what is the new average score?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: '74', explanation: 'Incorrect: Total sum is 456; 456 / 6 = 76.' },
      { key: 'B', text: '75', explanation: 'Incorrect: 75 × 6 = 450.' },
      { key: 'C', text: '78', explanation: 'Incorrect: 78 × 6 = 468.' },
      { key: 'D', text: '76', explanation: 'Correct: Total score for 5 attempts = 5 × 72 = 360. Add 6th attempt: 360 + 96 = 456. New average = 456 / 6 = 76.' },
    ],
    formulaHint: 'New Average = (Old Total + New Score) / Total Count',
    stepByStepSolution: [
      'Original sum of 5 scores = 5 × 72 = 360.',
      'Add the 6th score: 360 + 96 = 456.',
      'New number of tests = 6.',
      'New average = 456 / 6 = 76.'
    ],
  },
  {
    id: 'apt-quant-7',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Basic Probability',
    difficulty: 'Medium',
    question: 'Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the two faces is equal to 8?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '1/6', explanation: 'Incorrect: 1/6 = 6/36, but only 5 pairs sum to 8.' },
      { key: 'B', text: '7/36', explanation: 'Incorrect: 7 pairs sum to 7, not 8.' },
      { key: 'C', text: '5/36', explanation: 'Correct: Total outcomes = 6 × 6 = 36. Favorable outcomes summing to 8 are: (2,6), (3,5), (4,4), (5,3), (6,2) — exactly 5 combinations. Probability = 5/36.' },
      { key: 'D', text: '1/9', explanation: 'Incorrect: 1/9 = 4/36.' },
    ],
    formulaHint: 'Probability = Number of favorable outcomes / Total possible outcomes (36)',
    stepByStepSolution: [
      'Total possible outcomes when rolling 2 dice = 6 × 6 = 36.',
      'Favorable combinations that sum to 8:',
      '1. (2, 6)',
      '2. (3, 5)',
      '3. (4, 4)',
      '4. (5, 3)',
      '5. (6, 2)',
      'Total favorable outcomes = 5.',
      'Probability = 5 / 36.'
    ],
  },
  {
    id: 'apt-quant-8',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Number Problems',
    difficulty: 'Easy',
    question: 'The sum of three consecutive odd numbers is 69. What is the largest of these three numbers?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '23', explanation: 'Incorrect: 23 is the middle number (21 + 23 + 25 = 69).' },
      { key: 'B', text: '25', explanation: 'Correct: Let numbers be (x-2), x, (x+2). Sum = 3x = 69 => x = 23. The largest number is x + 2 = 25.' },
      { key: 'C', text: '27', explanation: 'Incorrect: 23 + 25 + 27 = 75.' },
      { key: 'D', text: '21', explanation: 'Incorrect: 21 is the smallest number.' },
    ],
    formulaHint: 'Let three consecutive odd numbers be x, x+2, x+4',
    stepByStepSolution: [
      'Let the consecutive odd numbers be x, x+2, and x+4.',
      'Equation: x + (x + 2) + (x + 4) = 69.',
      '3x + 6 = 69.',
      '3x = 63 => x = 21.',
      'The three numbers are 21, 23, and 25.',
      'The largest number is 25.'
    ],
  },

  // ==================== LOGICAL REASONING ====================
  {
    id: 'apt-logic-1',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Number Series',
    difficulty: 'Medium',
    question: 'Find the next number in the sequence: 4, 9, 25, 49, 121, 169, ?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: '196', explanation: 'Incorrect: 196 = 14², but 14 is a composite number.' },
      { key: 'B', text: '225', explanation: 'Incorrect: 225 = 15², but 15 is not prime.' },
      { key: 'C', text: '256', explanation: 'Incorrect: 256 = 16².' },
      { key: 'D', text: '289', explanation: 'Correct: The series consists of squares of consecutive prime numbers: 2² = 4, 3² = 9, 5² = 25, 7² = 49, 11² = 121, 13² = 169. The next prime number is 17, and 17² = 289.' },
    ],
    formulaHint: 'Pattern: Squares of consecutive prime numbers (2, 3, 5, 7, 11, 13, 17...)',
    stepByStepSolution: [
      'Examine the numbers: 4 = 2², 9 = 3², 25 = 5², 49 = 7², 121 = 11², 169 = 13².',
      'Observe the base numbers: 2, 3, 5, 7, 11, 13.',
      'These are consecutive prime numbers.',
      'The next prime number after 13 is 17.',
      '17² = 289.'
    ],
  },
  {
    id: 'apt-logic-2',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Coding and Decoding',
    difficulty: 'Medium',
    question: 'If in a certain code language, "SYSTEM" is encoded as "SYSMET" and "NEARER" is encoded as "AENRER", how is "FRACTION" encoded?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: 'ARFCNOIT', explanation: 'Correct: The word is divided into two halves. The first half is reversed, and the second half is reversed: "FRAC" reversed is "CARF" or first two and next two swapped. Specifically: F-R-A-C becomes A-R-F-C, T-I-O-N becomes N-O-I-T.' },
      { key: 'B', text: 'CARFNOIT', explanation: 'Incorrect: Examine the half partition letter shifting.' },
      { key: 'C', text: 'CRAFNOIT', explanation: 'Incorrect: Second half must reverse TION to NOIT.' },
      { key: 'D', text: 'ARFCTOIN', explanation: 'Incorrect: In FRACTION (8 letters), first 4 reversed (C-A-R-F) or swapped pairs.' },
    ],
    formulaHint: 'Divide word into two equal halves of 4 letters and reverse each half.',
    stepByStepSolution: [
      'In SYSTEM (6 letters): SYS | TEM -> First half "SYS" remains "SYS", second half "TEM" reversed is "MET" -> SYSMET.',
      'In NEARER (6 letters): NEA | RER -> First half reversed is "AEN", second half reversed is "RER" -> AENRER.',
      'In FRACTION (8 letters): First half = FRAC, Second half = TION.',
      'Reverse first half: C A R F.',
      'Reverse second half: N O I T.',
      'Combining both yields: CARFNOIT (or ARFC pattern depending on character pairing).'
    ],
  },
  {
    id: 'apt-logic-3',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Blood Relations',
    difficulty: 'Medium',
    question: 'Pointing to a photograph of a man, Priya said, "His mother is the only daughter of my mother." How is Priya related to the man?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'Sister', explanation: 'Incorrect: Priya is the mother, not the sister.' },
      { key: 'B', text: 'Grandmother', explanation: 'Incorrect: Priya’s mother is the grandmother.' },
      { key: 'C', text: 'Mother', explanation: 'Correct: "The only daughter of my mother" means Priya herself (since Priya is female). Thus, the man’s mother is Priya. Priya is the man’s mother.' },
      { key: 'D', text: 'Aunt', explanation: 'Incorrect: Priya is an only daughter of her mother.' },
    ],
    formulaHint: 'Break down statement from the end: "only daughter of my mother" = oneself (if female)',
    stepByStepSolution: [
      'Priya says: "His mother is the only daughter of my mother."',
      '"My mother’s only daughter" = Priya herself.',
      'Therefore, the man’s mother is Priya.',
      'Conclusion: Priya is the man’s mother.'
    ],
  },
  {
    id: 'apt-logic-4',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Direction Sense',
    difficulty: 'Easy',
    question: 'A candidate walks 20 meters North, turns right and walks 30 meters, turns right again and walks 20 meters. How far and in what direction is the candidate from the starting point?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '30 meters North', explanation: 'Incorrect: The candidate returned to the same horizontal latitude.' },
      { key: 'B', text: '30 meters East', explanation: 'Correct: Walking 20m North and then 20m South cancels the vertical displacement. The 30m walked after turning right (East) puts the candidate 30 meters directly East of the starting point.' },
      { key: 'C', text: '50 meters East', explanation: 'Incorrect: Displacement is 30 meters.' },
      { key: 'D', text: '30 meters South', explanation: 'Incorrect: The horizontal displacement was towards the East.' },
    ],
    formulaHint: 'Net North/South displacement = 20 - 20 = 0. Net East/West displacement = 30 East.',
    stepByStepSolution: [
      'Start at origin (0, 0).',
      'Walk 20 meters North: Position = (0, 20).',
      'Turn right (facing East) and walk 30 meters: Position = (30, 20).',
      'Turn right (facing South) and walk 20 meters: Position = (30, 0).',
      'Final displacement from origin (0, 0) is (30, 0), which is 30 meters East.'
    ],
  },
  {
    id: 'apt-logic-5',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Logical Puzzles',
    difficulty: 'Hard',
    question: 'In a campus coding competition of 16 participants, matches are conducted in single-elimination knockout format. How many total matches must be played to determine the undisputed winner?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '15 matches', explanation: 'Correct: In any single-elimination knockout tournament, each match eliminates exactly one participant. To determine 1 winner from N contestants, exactly N - 1 participants must be eliminated. For 16 contestants: 16 - 1 = 15 matches.' },
      { key: 'B', text: '16 matches', explanation: 'Incorrect: In knockout format, matches = N - 1.' },
      { key: 'C', text: '8 matches', explanation: 'Incorrect: 8 matches is only the first round.' },
      { key: 'D', text: '31 matches', explanation: 'Incorrect: That would be a double-elimination bracket.' },
    ],
    formulaHint: 'In single elimination, Total Matches = N - 1, where N is the number of participants.',
    stepByStepSolution: [
      'Round 1 (Round of 16): 8 matches (8 winners advance, 8 eliminated).',
      'Round 2 (Quarterfinals): 4 matches (4 winners advance, 4 eliminated).',
      'Round 3 (Semifinals): 2 matches (2 winners advance, 2 eliminated).',
      'Round 4 (Finals): 1 match (1 winner, 1 eliminated).',
      'Total matches = 8 + 4 + 2 + 1 = 15 matches.',
      'General rule: N - 1 = 16 - 1 = 15 matches.'
    ],
  },
  {
    id: 'apt-logic-6',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Letter Series',
    difficulty: 'Easy',
    question: 'What is the next letter in the sequence: B, D, G, K, P, ?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: 'T', explanation: 'Incorrect: Difference pattern is +2, +3, +4, +5, +6.' },
      { key: 'B', text: 'U', explanation: 'Incorrect: 16 + 6 = 22, which is V.' },
      { key: 'C', text: 'V', explanation: 'Correct: Positions in alphabet: B(2), D(4) [+2], G(7) [+3], K(11) [+4], P(16) [+5]. Next jump is +6: 16 + 6 = 22, which corresponds to the 22nd letter "V".' },
      { key: 'D', text: 'W', explanation: 'Incorrect: W is the 23rd letter.' },
    ],
    formulaHint: 'Add consecutive increasing increments: +2, +3, +4, +5, +6',
    stepByStepSolution: [
      'Convert letters to alphabetical indices: B=2, D=4, G=7, K=11, P=16.',
      'Examine intervals: 4 - 2 = +2, 7 - 4 = +3, 11 - 7 = +4, 16 - 11 = +5.',
      'Next interval must be +6.',
      '16 + 6 = 22.',
      'The 22nd letter in the English alphabet is V.'
    ],
  },
  {
    id: 'apt-quant-9',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Simple and Compound Interest',
    difficulty: 'Medium',
    question: 'A principal of $5,000 is invested at 10% per annum compound interest, compounded annually for 2 years. What is the total compound interest earned?',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '$1,000', explanation: 'Incorrect: $1,000 is the simple interest without compounding.' },
      { key: 'B', text: '$1,050', explanation: 'Correct: Amount = P(1 + r/100)^t = 5000 × (1.10)^2 = 5000 × 1.21 = $6,050. CI = $6,050 - $5,000 = $1,050.' },
      { key: 'C', text: '$1,100', explanation: 'Incorrect: Calculation error.' },
      { key: 'D', text: '$1,025', explanation: 'Incorrect: That would be semi-annual simple interest.' },
    ],
    formulaHint: 'CI = P × [(1 + r/100)^t - 1]',
    stepByStepSolution: [
      'Year 1 Interest = 10% of $5,000 = $500.',
      'Principal for Year 2 = $5,000 + $500 = $5,500.',
      'Year 2 Interest = 10% of $5,500 = $550.',
      'Total Compound Interest = $500 + $550 = $1,050.'
    ],
  },
  {
    id: 'apt-quant-10',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Mixtures and Alligations',
    difficulty: 'Hard',
    question: 'In what ratio must tea costing $60 per kg be mixed with tea costing $65 per kg so that the resulting mixture is worth $62 per kg?',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '3:2', explanation: 'Correct: By rule of alligation: (Cost of dearer - Mean) / (Mean - Cost of cheaper) = (65 - 62) / (62 - 60) = 3 / 2 = 3:2.' },
      { key: 'B', text: '2:3', explanation: 'Incorrect: Inverted ratio.' },
      { key: 'C', text: '3:4', explanation: 'Incorrect: Calculation error.' },
      { key: 'D', text: '5:2', explanation: 'Incorrect: Rule of alligation requires (65-62)/(62-60).' },
    ],
    formulaHint: 'Quantity of Cheaper / Quantity of Dearer = (d - m) / (m - c)',
    stepByStepSolution: [
      'Cheaper price (c) = $60/kg.',
      'Dearer price (d) = $65/kg.',
      'Mean price (m) = $62/kg.',
      'Ratio = (d - m) : (m - c) = (65 - 62) : (62 - 60) = 3 : 2.'
    ],
  },
  {
    id: 'apt-quant-11',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Quantitative Aptitude',
    skill: 'Basic Algebra',
    difficulty: 'Easy',
    question: 'If 3x + 2y = 26 and y = 4, what is the value of 2x - y?',
    correctAnswer: 'C',
    options: [
      { key: 'A', text: '6', explanation: 'Incorrect: 2x - y = 2(6) - 4 = 8.' },
      { key: 'B', text: '10', explanation: 'Incorrect: 2(6) - 4 = 8.' },
      { key: 'C', text: '8', explanation: 'Correct: Substitute y = 4: 3x + 8 = 26 => 3x = 18 => x = 6. Then 2x - y = 2(6) - 4 = 12 - 4 = 8.' },
      { key: 'D', text: '12', explanation: 'Incorrect: 12 is 2x, forgot to subtract y.' },
    ],
    formulaHint: 'Substitute known variable and solve linear equation.',
    stepByStepSolution: [
      'Given 3x + 2y = 26 and y = 4.',
      '3x + 2(4) = 26 => 3x + 8 = 26.',
      '3x = 18 => x = 6.',
      'Compute 2x - y: 2(6) - 4 = 12 - 4 = 8.'
    ],
  },
  {
    id: 'apt-logic-7',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Syllogisms',
    difficulty: 'Medium',
    question: 'Statements:\n1. All algorithms are programs.\n2. All programs are logic.\nConclusions:\nI. All algorithms are logic.\nII. Some logic are algorithms.\nWhich conclusion(s) follow logically?',
    correctAnswer: 'D',
    options: [
      { key: 'A', text: 'Only conclusion I follows', explanation: 'Incorrect: Conclusion II also follows by conversion.' },
      { key: 'B', text: 'Only conclusion II follows', explanation: 'Incorrect: Conclusion I also follows transitively.' },
      { key: 'C', text: 'Neither conclusion follows', explanation: 'Incorrect: Both statements follow valid deductive logic.' },
      { key: 'D', text: 'Both conclusion I and II follow', explanation: 'Correct: Transitive property: All A are B, and all B are C implies All A are C (Conclusion I). If All A are C, then Some C are A (Conclusion II).' },
    ],
    formulaHint: 'Universal affirmative syllogism: All A are B and All B are C => All A are C and Some C are A.',
    stepByStepSolution: [
      'Draw Euler circles: Circle(Algorithms) ⊂ Circle(Programs) ⊂ Circle(Logic).',
      'Conclusion I: All algorithms are enclosed inside Logic => Follows.',
      'Conclusion II: Logic circle encloses algorithms, so some part of Logic is Algorithms => Follows.',
      'Therefore, both I and II follow.'
    ],
  },
  {
    id: 'apt-logic-8',
    role: 'All Roles',
    type: 'APTITUDE',
    topic: 'Logical Reasoning',
    skill: 'Pattern Recognition',
    difficulty: 'Medium',
    question: 'Find the missing number in the 3x3 matrix:\n[ 3   4   25 ]\n[ 5   12  169 ]\n[ 7   24  ?   ]',
    correctAnswer: 'B',
    options: [
      { key: 'A', text: '576', explanation: 'Incorrect: 24² = 576, but need 7² + 24².' },
      { key: 'B', text: '625', explanation: 'Correct: The pattern in each row is a Pythagorean triple: row 1: 3² + 4² = 9 + 16 = 25. Row 2: 5² + 12² = 25 + 144 = 169. Row 3: 7² + 24² = 49 + 576 = 625.' },
      { key: 'C', text: '676', explanation: 'Incorrect: 676 = 26².' },
      { key: 'D', text: '490', explanation: 'Incorrect: The pattern is sum of squares: 49 + 576 = 625.' },
    ],
    formulaHint: 'Row pattern: Col1² + Col2² = Col3',
    stepByStepSolution: [
      'Row 1: 3² + 4² = 9 + 16 = 25.',
      'Row 2: 5² + 12² = 25 + 144 = 169.',
      'Row 3: 7² + 24² = 49 + 576 = 625.',
      'Missing number is 625.'
    ],
  },
];
