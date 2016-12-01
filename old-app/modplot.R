library(ggplot2)

# a^x mod N
# From Wikipedia pseudocode
modExp <- function(a, x, N) {
	result = 1
	a = a %% N
	while (x > 0) {
		if (x %% 2 == 1) {
			result = (result * a) %% N
		}
		x = bitwShiftR(x, 1)
		a = (a*a) %% N
	}
	result
}

plotModExp <- function(a, N, maxX) {
	xrange = 0:maxX
	df = data.frame(x = xrange, f = sapply(xrange, modExp, N = N, a = a))
	ggplot(data = df, aes(x = x, y = f)) + geom_step() +
																			   theme_classic() +
																			   theme(axis.line = element_blank(), axis.text = element_blank(), axis.ticks = element_blank(), axis.title = element_blank()) +
																			   scale_x_continuous(expand = c(0,0))

}