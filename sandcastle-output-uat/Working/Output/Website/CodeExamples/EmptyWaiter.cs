public static void NavigateToFunctionalArea(string caption)
{
	WebDriverWait navigateWaiter = new WebDriverWait(Driver, TimeSpan.FromSeconds(TimeoutSecs));
	navigateWaiter.IgnoreExceptionTypes(typeof(InvalidOperationException));
	navigateWaiter.Until(driver =>
	{
		throw new NotImplementedException();
	});
}