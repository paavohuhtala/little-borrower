import React, { useCallback, useContext, useState } from 'react';
import SyntaxHighlighter from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/cjs/styles/hljs/xcode";

import questionStyles from "../styles/Question.module.scss";

const Rust: React.FC<{ language?: "rust" | null }> = ({ children, language = "rust" }) => {
  return (
    <SyntaxHighlighter
      customStyle={{ display: "inline-block", padding: 0, fontSize: "14px" }}
      language={language ?? undefined}
      style={style}
    >
      {children}
    </SyntaxHighlighter>
  );
};

const Law: React.FC<{ title: string }> = ({ children, title }) => {
  return <div className={questionStyles.law}>
    <h3>{title}</h3>
    {children}
  </div>
}

export const ChoiceContext = React.createContext({ nextStep: () => { } });

const Choice: React.FC<{}> = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState<number | undefined>()
  const { nextStep } = useContext(ChoiceContext)

  const setSelected = useCallback((option: number) => {
    if (selectedOption === undefined) {
      setTimeout(nextStep, 500)
    }

    setSelectedOption(option);
  }, [nextStep]);

  return <div className={questionStyles.choice} data-selected={selectedOption !== undefined ? 'true' : undefined}>
    {React.Children.map(children, (option, index) => <button key={index} onClick={() => setSelected(index)} data-selected={selectedOption === index || undefined}>
      {'> '}{option}
    </button>)
    }
  </div>
}

export type Question =
  | {
    question: JSX.Element;
    answer: JSX.Element;
  }
  | {
    section: JSX.Element | string;
  }
  | {
    block: JSX.Element;
  };

export const questions: Question[] = [
  {
    question: <p>Hello!</p>,
    answer: <p>Hi!</p>,
  },
  {
    question: (
      <p>
        Have you read <em>The Little Schemer</em> or <em>The Little Typer</em>, or possibly even <a href="https://davazp.net/little-typescripter/"><em>The Little TypeScripter</em></a>?
      </p>
    ),
    answer: <Choice>
      <span>Yes, and they were all Excellent!</span>
      <span>No...</span>
    </Choice>,
  },
  {
    question: <p>Have you used Rust?</p>,
    answer: <p>I've looked into the basics, but I don't really understand this ownership and borrowing thing.</p>,
  },
  {
    question: <p>That is good enough. Have you had dinner yet?</p>,
    answer: <p>As a matter of fact, yes.</p>,
  },
  {
    question: <p>Any room for dessert?</p>,
    answer: <p>You bet!</p>,
  },
  {
    section: <>My (not your) cake recipe</>,
  },
  {
    question: (
      <p>
        What is <code>cake_recipe</code>?
      </p>
    ),
    answer: (
      <p>
        Judging by the name, it is probably a variable. But of what type?
      </p>
    ),
  },
  {
    question: <>
      <p><code>cake_recipe</code> is a local variable of type <code>Recipe</code>. We'll get to the definition of <code>Recipe</code> later.</p>
      <p>Could you assign the cake recipe to a local variable named <code>table</code>?</p>
    </>,

    answer: (
      <>
        <p>
          Sounds simple enough:
        </p>
        <Rust>
          {`let table = cake_recipe;`}
        </Rust>
      </>
    ),
  },

  {
    question: (
      <p>
        Could you assign <code>cake_recipe</code> to a local variable named <code>bookshelf</code> as well?
      </p>
    ),
    answer: (
      <>
        <p>
          This should work:
        </p>
        <Rust>
          {`let bookshelf = cake_recipe;`}
        </Rust>
        <p>
          ... but wait a second! The compiler <i>did not</i> like that one bit. What did I do wrong?
        </p>
      </>
    ),
  },
  {
    block: (
      <>
        <Rust language={null}>
          {`
error[E0382]: use of moved value: \`cake_recipe\`
  --> src/main.rs:13:19
   |
2  |   let cake_recipe = Recipe {
   |       ----------- move occurs because \`cake_recipe\` has type \`Recipe\`, which does not implement the \`Copy\` trait
...
12 |   let table = cake_recipe;
   |               ----------- value moved here
13 |   let bookshelf = cake_recipe;
   |                   ^^^^^^^^^^^ value used here after move
`}
        </Rust>
      </>
    )
  },
  {
    question: (
      <p>
        Instead of using <code>cake_recipe</code> again, what happens if you use <code>table</code> instead?
      </p>
    ),
    answer: (
      <>
        <p>I don't expect that to make a difference, but let's try it anyway. So we would have:</p>
        <Rust>
          {`let table = cake_recipe;
let bookshelf = table;`}
        </Rust>
        <p>And the compiler accepts it. Why?</p>
      </>
    )
  },

  {
    question: (
      <p>
        Why, indeed. Assuming the compiler doesn't have anything against bookshelves, what could have happened instead?<code></code>
      </p>
    ),
    answer: (
      <p>
        Does the assignment from <code>cake_recipe</code> to <code>table</code> also modify <code>cake_recipe</code>?
      </p>
    ),
  },

  {
    question: <p>In a sense, yes. After the <i>value</i> of <code>cake_recipe</code> was used once, the compiler doesn't allow the <i>variable</i> to be used again.</p>,
    answer: <>
      <p>And the same is presumably true with <code>table</code> and <code>bookshelf</code> as well.</p>
      <p>
        But you said the variable can't be used again. Never <i>ever</i> again?
      </p></>,
  },

  {
    question: <p>Could you assign the recipe back from <code>bookshelf</code> to <code>cake_recipe</code>?</p>,
    answer: <p>Since variables are immutable by default in Rust, only if <code>cake_recipe</code> was <code>mut</code>able.</p>
  },

  {
    question: <p>What if <code>cake_recipe</code> was a <code>mut</code>able variable?</p>,
    answer: <>
      <Rust>{`cake_recipe = bookshelf;`}</Rust>
      <p>Yes, that is accepted by the compiler. And I can now use <code>cake_recipe</code> again.</p>
      <Rust>{`let fridge_door = cake_recipe;`}</Rust>
    </>
  },

  {
    question: (
      <>
        <p>When a value is assigned to a variable, the variable becomes the <b>owner</b> of the value.</p>
        <p>When the value of a variable is used (for example on the right side of an assignment), the ownership of the value is transferred to a new owner. This is known as a <b>move</b>.</p>
        <p>What happens to the previous owner?</p>
      </>
    ),
    answer: (
      <>
        <p>The compiler did not allow us to use the value of the previous owner, but we can access the variable again after assigning (or moving?) something new to it.</p>
      </>
    ),
  },

  {
    question: <>
      <p>Precisely. Moving a value from a variable to another <b>invalidates</b> the previous owner.</p>
      <p>A variable which doesn't own anything cannot be used, except to assign a new value to it.</p>
      <p>How many owners can a value have?</p>
    </>,
    answer: <>
      <p>Since ownership is always moved on assignment, it seems that each value can have only one owner.</p>
    </>
  },

  {
    block: <>
      <Law title="The First Law of Ownership">Each value has an owner.</Law>
      <Law title="The Second Law of Ownership">Each value can have only one owner at a time. The ownership of a value can be moved between owners.</Law>
    </>
  },

  {
    question: (
      <p>
        Any questions at this point?
      </p>
    ),
    answer: <p>Just one: what is the point in all this? I don't see why having the same value in multiple variables is such a bad thing...</p>,
  },

  {
    question: <p>Do you know about the <b>stack</b> and the <b>heap</b>?</p>,
    answer: <p>They have something to do with memory, I think. I thought we were talking about ownership?</p>,
  },

  {
    question: <p>Understanding them is important to understanding the final law of ownership, and the motivation for all this.</p>,
    answer: <p>I could use a little reminder.</p>,
  },
  {
    section: <>Aside: the Stack and the Heap</>
  },

  {
    question: <>

      <p>Both the stack and the heap are sections of memory, which are used by your program to store data at run time.</p>
      <p>The stack is used for function calls and local variables. Whenever a function is called, some space is reserved on the stack for the local variables of the function. The stack is also used to store the return address (where the function was called), so when the function <code>return</code>s, the program knows where to continue execution.</p>
    </>,
    answer: <p>Does this have something to do with Stack Overflow?</p>,
  },

  {
    question: <>
      <p>Yes, the website is named after an error known as — you guessed it — stack overflow. The size of the stack is typically quite limited compared to the total amount of RAM<sup>1</sup>, and going over the limit generally speaking means that the program crashes with a stack overflow error.</p>
      <p>Since we can only use a small fraction of the available memory with the stack, what does that mean for the heap?</p>
      <p><sup>1</sup> Even in 2021 the size of the stack is typically between 1 and 8 megabytes.</p>
    </>,
    answer: <>
      <p>Since the stack can only store a limited amount of data before causing a terrible crash, it must mean that most data is stored on heap.</p>
    </>
  }
];
