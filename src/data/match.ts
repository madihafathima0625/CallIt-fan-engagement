export type Level = "newcomer" | "pro";
export type Moment = {
  id: number; over: string; score: string;
  situation: Record<Level, string>;
  question: string;
  options: [string, string, string];
  correctIndex: number;
  analystPick: number;
  analystWhy: Record<Level, string>;
  outcome: string;
  explanation: Record<Level, string>;
};
export const matchInfo = { title: "Blue Hawks vs Red Lions", format: "T20 chase: Red Lions need 168 to win" };

export const moments: Moment[] = [
{ id:1, over:"Over 1", score:"Lions 0/0",
  situation:{newcomer:"The Lions' opener faces the first fast bowler of the game.", pro:"Powerplay, opener on strike against pace, two fielders only outside the circle."},
  question:"What happens on this ball?",
  options:["Boundary","Dot or single","Wicket"], correctIndex:0, analystPick:0,
  analystWhy:{newcomer:"Early in the innings few fielders guard the boundary, so attacking shots pay off.", pro:"Fielding restrictions mean gaps in the ring; fresh pitch favors the attacker."},
  outcome:"FOUR! Driven through the covers.",
  explanation:{newcomer:"In the first 6 overs only two fielders may stand near the boundary, so hitting is easier.", pro:"Powerplay field limits (2 outside the circle) make aggressive driving high-percentage."} },
{ id:2, over:"Over 4", score:"Lions 31/0",
  situation:{newcomer:"A spin bowler comes on for the first time.", pro:"Spinner introduced at the end of the powerplay, openers set."},
  question:"What happens on this ball?",
  options:["Boundary","Dot or single","Wicket"], correctIndex:2, analystPick:1,
  analystWhy:{newcomer:"Spinners usually slow the scoring down, so I expect a quiet ball.", pro:"Spin cuts pace-on-the-ball; I expect a dot or single against a set batter."},
  outcome:"WICKET! The batter swings and misses, bowled.",
  explanation:{newcomer:"Batters often try a big shot against a new bowler and lose their wicket.", pro:"Set batter tried to take down the spinner immediately; the turn beat the bat."} },
{ id:3, over:"Over 7", score:"Lions 52/2",
  situation:{newcomer:"The umpire says the batter is out LBW. The batter asks for a video review.", pro:"LBW given out on field, batter reviews. Ball-tracking will decide."},
  question:"What will the review show?",
  options:["Decision stays: OUT","Overturned: NOT OUT","Umpire's call"], correctIndex:1, analystPick:1,
  analystWhy:{newcomer:"The ball looked high, so it may miss the stumps.", pro:"Impact looked marginally outside the line and the ball was bouncing over the top of the stumps."},
  outcome:"Overturned! The ball was going over the stumps.",
  explanation:{newcomer:"Ball-tracking predicts where the ball would have gone. Here it would have missed.", pro:"Ball-tracking projected the ball clearing the top of the stumps, so the on-field call was reversed."} },
{ id:4, over:"Over 10", score:"Lions 78/3 (need 90 off 60)",
  situation:{newcomer:"The Lions are behind the target pace and must score faster.", pro:"Required rate has crept above 9; set batter on strike."},
  question:"How many runs come off this over?",
  options:["0 to 5","6 to 10","11 or more"], correctIndex:2, analystPick:2,
  analystWhy:{newcomer:"The Lions are falling behind, so they will take risks.", pro:"Required rate pressure forces the batters to attack."},
  outcome:"14 runs: a six and a four.",
  explanation:{newcomer:"When a team is behind, batters swing harder.", pro:"The required rate rose above 9, which pushes batters into high-risk shots."} },
{ id:5, over:"Over 13", score:"Lions 101/4 (need 67 off 42)",
  situation:{newcomer:"The Hawks' best fast bowler returns.", pro:"Captain brings back his strike bowler against a batter trying to accelerate."},
  question:"What happens on this ball?",
  options:["Boundary","Dot or single","Wicket"], correctIndex:2, analystPick:2,
  analystWhy:{newcomer:"Star bowlers often get wickets when batters rush.", pro:"Batter must attack here; best bowler plus forced risk raises wicket odds."},
  outcome:"WICKET! Caught at long-on.",
  explanation:{newcomer:"The batter tried to hit a six but the ball went to a fielder.", pro:"Forced aggression against a top death bowler produced a mistimed shot."} },
{ id:6, over:"Over 16", score:"Lions 128/5 (need 40 off 24)",
  situation:{newcomer:"The Lions need 40 runs from the last 4 overs.", pro:"Asking rate is 10 per over, new batter at the crease."},
  question:"How many runs come off this over?",
  options:["0 to 5","6 to 10","11 or more"], correctIndex:1, analystPick:2,
  analystWhy:{newcomer:"They are desperate, so I expect a big over.", pro:"At 10 an over they must go hard, so I expect 11+."},
  outcome:"9 runs: smart singles and one four.",
  explanation:{newcomer:"Hitting every ball is risky. The Lions played safe and kept the target alive.", pro:"A new batter took singles to settle, a sound tactical choice. I overestimated their aggression."} },
{ id:7, over:"Over 20", score:"Lions 160/6 (need 8 off 6)",
  situation:{newcomer:"Last over. The Lions need 8 runs from 6 balls.", pro:"Final over, 8 required, set batter on strike."},
  question:"Who wins?",
  options:["Red Lions win","Blue Hawks win","Tie"], correctIndex:0, analystPick:0,
  analystWhy:{newcomer:"8 runs in 6 balls is gettable for a batter who is already set.", pro:"8 off 6 with a set batter is under 1.5 per ball, which favours the chase."},
  outcome:"Red Lions win! A six off the last ball seals it.",
  explanation:{newcomer:"Only 2 runs came from the first five balls, so the batter needed a six off the last ball and hit it.", pro:"Two off the first five balls left 6 needed off the last. The set batter cleared the rope."} }
];
