WebDriverWait navigateWaiter = new WebDriverWait(Driver, TimeSpan.FromSeconds(TimeoutSecs));
navigateWaiter.IgnoreExceptionTypes(typeof(InvalidOperationException));
navigateWaiter.Until(driver =>
{
	IWebElement functionalAreaElement = driver.FindElement(null);
	if (!functionalAreaElement.Displayed) return false;
	functionalAreaElement.Click();
	return true;
});