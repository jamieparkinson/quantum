Grover's Search Algorithm
=========================
 
Grover's algorithm is a quantum search algorithm, discovered by Lov Grover [[@grover_quantum_1997]]. A search algorithm, given some database of things, aims to find one specific item - a "needle in a haystack".

## Constructing the Algorithm
One of many full descriptions of the algorithm is given in the excellent book by Nielsen and Chuang [[@nielsen_quantum_2010]] but we summarise it briefly here. We set up the algorithm as follows.

We say that there are $N$ items in our database, and we index them accordingly (although their order is unimportant) by the integers in the range $0$ to $N-1$, calling this index $x$. We can represent any value of $x$ with $n$ classical bits<sidenote>We do this by using the ordering of the sequence 0s and 1s; each consecutive digit in the sequence represents an decreasing (starting from $n-1$) power of 2, and the integer is given by the sum of these powers of 2 multiplied by the digit. An example makes this clear: 
$$ 0101 \rightarrow 0 \cdot 2^3 + 1 \cdot 2^2 + 0 \cdot 2^1 + 1 \cdot 2^0 = 4 + 1 = 5 $$
</sidenote>
, where $2^{n-1} \leq N \leq 2^n - 1$, and so for convenience we choose $N$ to be some integer power $n$ of 2. We identify the specific item we want - the needle - as having the index $x_0$ and define an *oracle* function $f$:

$$f(x)=
\begin{cases}
1 & x = x_0 \\
0 & x \neq x_0
\end{cases}$$

And so the search problem is to apply the oracle to successive values of $x$ until it returns 1 (the needle is found). As this is a quantum algorithm, we need to make the oracle work on quantum states and so we define an *oracle operator* $O$:

$$O( \ket{x} \ket{b} ) = \ket{x} \ket{b \oplus f(x)}$$

Where $\ket{b}$ is the *oracle qubit* and $\oplus$ denotes binary modular addition<sidenote>Modular addition is like normal addition except the number line is periodic - when we reach a certain value we go back to the beginning. For example, on a 12-hour clock if we add 6 hours to 11 then rather than getting 17, we get $11 + 6 \pmod {12} = 5$. Our oracle operator, as with most of information theory, uses addition modulo 2 - the only numbers we're allowed are 0 and 1! For example, $1 \oplus 0 = 1 \pmod 2 = 1$, but $1 \oplus 1 = 2 \pmod 2 = 0$.</sidenote>.

Now we perform the first "quantum" step: say that we put the oracle qubit $\ket{b}$ in the $\ket{-}$ state, equal to $(\ket{0} - \ket{1})/\sqrt{2}$. Now the action of the oracle operator is:

$$\begin{align}
O( \ket{x} \ket{-} ) & = \frac{1}{\sqrt{2}} \ket{x} \left( \ket{0 \oplus f(x)} - \ket{1 \oplus f(x)} \right) \\
& = (-1)^{f(x)} \ket{x} \left( \frac{\ket{0} - \ket{1}}{\sqrt{2}} \right) \\
& = (-1)^{f(x)} \ket{x} \ket{-}
\end{align}$$

So, for the special case of the oracle qubit being $\ket{-}$, we can say that the oracle operator flips the phase of the index bit $\ket{x}$ if and only if it is the needle (ie $x=x_0$). As the oracle qubit is unchanged by this operation, we can effectively ignore it. 

## Performing the search

Now that we have set up the search problem and provided an operator that can change the phase of the needle qubit, we can give the procedure for the Grover search<sidenote>We use the obvious extension of the binary notation explained in the first sidenote: $$\ket{x} \equiv \ket{x_1 x_2 \cdots x_n}$$ where $$x = x_1 2^{n-1} + x_2 2^{n-2} + \cdots + x_n 2^0$$ For example, $\ket{5} \equiv \ket{0101}$. The important thing here is to remember that some state $\ket{x}$ is **not** a state of a single qubit; it is a state of $n$ qubits.</sidenote>. Steps 1 and 2 are just to get the system in an appropriate starting state, and step 3 is where the "magic" happens.

1. For a haystack size of $N = 2^n$, prepare $n+1$ qubits in the ground state: $$\ket{\psi_1} = \ket{0}^{\otimes n} \ket{0}$$
2. Put the first $n$ qubits (the haystack qubits) in a state of uniform superposition, and then put the last qubit, the oracle qubit, in the state described above. That is to say, we apply $(H^{\otimes n} \otimes H X)$ to all of the qubits. $$\ket{\psi_2} = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} \ket{x} \ket{-}$$
3. *__The Grover Iteration__* - perform this step $R$ times<sidenote>We will discuss the value of R later</sidenote> 
    \ 
    i. *Apply the oracle operator $O$, defined above, to all the qubits.*
    ii. *Apply the Hadamard transform $H^{\otimes n}$ to the haystack qubits.*
    iii. *Multiply all states which are not $\ket{0}$ by $-1$. This can be written as an operator, $2 \ket{0}\bra{0} - I$, where $I$ is the identity matrix of dimension $N$.*
    iv. *Apply the $H^{\otimes n}$ to the haystack qubits again.*  
    \ 

    It can be shown<sidenote>Applying steps *i-iv* is equivalent to applying:
    $$\begin{align}
    & \: H^{\otimes n}(2 \ket{0} \bra{0} - I)H^{\otimes n} O \\
    = & \: (2 H^{\otimes n} \ket{0} \bra{0} H^{\otimes n} - H^{\otimes n} H^{\otimes n}) O
    \end{align}$$ We then recall that in this case $\ket{0}$ is really representing an $n$-qubit state $\ket{00 \cdots 0}$, and also that $H \ket{0} = (\ket{0} + \ket{1})/\sqrt{2}$, so that:
    $$\begin{align}
    H^{\otimes n} \ket{0} & = \overbrace{(H \ket{0}) \otimes (H \ket{0}) \otimes \cdots \otimes (H \ket{0})}^{n \text{ times}} \\
    & = \frac{1}{\left(\sqrt{2}\right)^n} \Big( [\ket{0} + \ket{1}] \otimes [\ket{0} + \ket{1}] \otimes \cdots \otimes [\ket{0} + \ket{1}] \Big) \\
    & = \frac{1}{\sqrt{2^n}} \sum \big\{ \text{All permutations of } n \text{ 1s and 0s} \big\} \\
    & = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} \ket{x} = \ket{\phi}
    \end{align}$$ Finally, remember that $\bra{\chi} A^\dagger = (A \ket{\chi})^\dagger$, that $H = H^\dagger$, and that $H^2 = I$. Then we can write:
    $$\begin{align}
     & \: (2 H^{\otimes n} \ket{0} \bra{0} H^{\otimes n} - H^{\otimes n} H^{\otimes n}) O \\
    = & \: (2 (H^{\otimes n} \ket{0})(H^{\otimes n} \ket{0})^\dagger - I) O \\
    = & \: (2 \ket{\phi} \bra{\phi} - I) O \qquad \qquad \qquad \qquad \Box
    \end{align}$$</sidenote> that the above steps $i-iv$ can be written as a single operator: $$(2\ket{\phi} \bra{\phi} - I)O$$ Where $\ket{\phi}$ is the uniform superposition of the haystack qubits (ie $\ket{\psi_2}$ without the oracle qubit): $$\ket{\phi} = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} \ket{x}$$
    It is extremely useful to note that the part of this operation in the brackets can be seen geometrically as an *inversion about the mean*. Let's consider why this is.
    The operator $F = 2(\ket{\phi} \bra{\phi} - I)$ leaves  $\ket{\phi}$ invariant and flips the sign of any state orthogonal to $\ket{\phi}$. As $\ket{\phi}$ is the uniform superposition over all $n$-qubit states, the overlap of it and any other $n$-qubit state expressed in the computational basis, $\ket{\psi} = \sum_x a_x \ket{x}$, is simply the sum of $\ket{\psi}$'s eigenvalues multiplied by $\ket{\phi}$'s normalisation factor, $1/\sqrt{N}$: $$\bra{\phi} \psi \rangle = \frac{1}{\sqrt{N}}\sum_x a_x$$ It follows that:
    $$\begin{align}
    F \ket{\psi} & = (2(\ket{\phi} \bra{\phi} - I)) \ket{\psi} \\
    & = 2 \bra{\phi} \psi \rangle \ket{\phi} - \ket{\psi} \\
    & = 2 \sum_x \left( \frac{1}{\sqrt{N}} \frac{1}{\sqrt{N}} \sum_i a_i \right) \ket{x} - \sum_x a_x \ket{x} \\
    & = \sum_x \Bigg[ 2 \underbrace{\left( \frac{1}{N} \sum_i a_i \right)}_{\text{ (mean of the } a_i \text{)}} - a_x \Bigg] \ket{x}
    \end{align}$$ Which clearly maps amplitudes across the mean.
4. After our repeated application of step 3, we should have $$\ket{\psi_4} \approx \ket{x_0}\ket{-}$$ And so we measure the $n$ haystack qubits (ignoring the oracle qubit as its work is done) and obtain the needle $x_0$ with high probability.

The repeated sign changes of the needle state combined with the flips about the mean increase the needle state's amplitude compared to the rest of the haystack. When this is sufficiently high, a measurement on the haystack qubits will return the needle state with high probability ($\propto [\text{needle amplitude}]^2$).

## How many iterations?

We said that it is necessary to apply step 3 some number $R$ of times in order to obtain the needle state with sufficiently high probability. We'll now look at what value $R$ might take. 

First, write our initial state as: $$\ket{\psi} = \nu_0 \ket{x_0} + \sum_{x \neq x_0} \eta_0 \ket{x}$$ Where the subscripts on $\nu$ and $\eta$ denote the number of Grover iterations performed. Referring to Step 2 of the above, note that $\nu_0 = \eta_0 = 1/\sqrt{N}$. Now consider the action of the Grover iteration on the $\nu_j$ and $\eta_j$:

i. Action of the oracle is denoted by a prime: $$\nu_j^\prime = -\nu_j$$
ii. Inversion about the mean. Call the mean $\mu$: $$\mu_i = \frac{1}{N}(\nu_i + (N-1)\eta_i) = \frac{\nu_i - \eta_i}{N} + \eta_i$$ And so we can see that $$\begin{align}
\nu_{j+1} & = 2\mu_j^\prime - \nu_j^\prime \\
& = 2\frac{\nu_j^\prime - \eta_j}{N} + 2\eta_j - \nu_j^\prime \\
& = \frac{N-2}{N} \nu_j + \frac{2(N-1)}{N} \eta_j \\
\eta_{j+1} & = 2\mu_j^\prime - \eta_j \\
& = 2\frac{\nu_j^\prime - \eta_j}{N} + 2\eta_j - \eta_j \\
& = -\frac{2}{N} \nu_j + \frac{N-2}{N} \eta_j
\end{align}$$

It is rather difficult to solve these recurrence relations, but their solutions are given in Ref [[@boyer_tight_1998]]. The solutions are: $$\begin{align} \nu_j & = \sin([2j+1]\theta) \\ \eta_j & = \frac{1}{\sqrt{N-1}}\cos([2j+1]\theta) \end{align}$$ Where $\sin^2 \theta = 1/N$. The validity of these solutions can be proven by induction<sidenote>We prove as follows. 
\

**Basis case**. Set $j=0$. Now insert into the solution:
$$\begin{align} \nu_0 & = \sin(\theta) \\
& = \sin(\arcsin(\frac{1}{\sqrt{N}})) \\
& = \frac{1}{\sqrt{N}} \\
\eta_0 & = \frac{1}{\sqrt{N-1}}\cos(\theta) \\
& = \frac{1}{\sqrt{N-1}}\cos(\arcsin(\frac{1}{\sqrt{N}})) \\
& = \frac{1}{\sqrt{N-1}} \sqrt{1 - \frac{1}{N}} \\
& = \frac{1}{\sqrt{N-1}} \sqrt{\frac{N-1}{N}} = \frac{1}{\sqrt{N}}
\end{align}$$ Which satisfy the boundary conditions we noted in the main text. 
\

**Inductive step**. Assume the solution is valid for $j$, now test for $j+1$:
$$\begin{align} \nu_{j+1} & = \sin([2(j+1)+1]\theta) \\
& = \sin([2j + 1]\theta + 2\theta) \\
& = \sin([2j + 1]\theta) \cos(2\theta) + \cos([2j + 1]\theta) \sin(2 \theta) \\
& = \nu_j (\cos^2\theta - \sin^2\theta) + \sqrt{N-1} \eta_j (2 \cos\theta \sin\theta) \\
& = \nu_j (\frac{N-1}{N} - \frac{1}{N}) + \sqrt{N-1} \eta_j (2 \sqrt{\frac{N-1}{N}} \frac{1}{\sqrt{N}}) \\
& = \frac{N-2}{N} \nu_j + \frac{2(N-1)}{N} \eta_j \\
\eta_{j+1} & = \frac{1}{\sqrt{N-1}} \cos([2(j+1) + 1]\theta) \\
& = \frac{1}{\sqrt{N-1}} \cos([2j + 1]\theta + 2 \theta) \\
& = \frac{1}{\sqrt{N-1}} \big( \cos([2j+1]\theta) \cos(2\theta) - \sin([2j+1]\theta) \sin(2\theta) \big) \\
& = \frac{1}{\sqrt{N-1}} ( \sqrt{N-1} \eta_j \frac{N-2}{N} - 2 \nu_j \frac{\sqrt{N-1}}{N} ) \\
& = -\frac{2}{N} \nu_j + \frac{N-2}{N} \eta_j
\end{align}$$
Q.E.D.</sidenote>. As we want to maximise the probability of measuring the needle, we clearly want to maximise $\nu_j$. The maximum of $\sin(x)$ is at $x = \pi/2$ and so we want $(2j + 1)\theta = \pi/2$. Considering that $j$ must be an integer, we want: $$j = \left \lfloor \frac{\pi - 2\theta}{4\theta} \right \rfloor$$ Now see that since $\sin\theta \approx \theta$ for small $\theta$ and recalling that $\sin\theta = 1/\sqrt{N}$:
$$j \approx \left \lfloor \frac{\pi - 2/\sqrt{N}}{4/\sqrt{N}} \right \rfloor \approx \left \lfloor \frac{\pi}{4}\sqrt{N} \right \rfloor$$
And thus we choose $R$ to be the above value. Note an interesting - and characteristically quantum - implication of the sinusoidal form for $\nu_j$: we can perform too many iterations of the algorithm! In the classical world we'd expect our extra work to reap us some reward (or at least not to make things *worse*) but here the performance of the algorithm is periodic in $R$ so we need to stop at exactly the right point in order to find our needle.

## References