#include "GlasslineUILayerWidget.h"

#include "Blueprint/WidgetTree.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "WebBrowser.h"

namespace
{
	const TCHAR* GlasslineConsolePrefix = TEXT("__GLASSLINE__");

	FString EscapeJavaScriptString(FString Value)
	{
		Value.ReplaceInline(TEXT("\\"), TEXT("\\\\"));
		Value.ReplaceInline(TEXT("'"), TEXT("\\'"));
		Value.ReplaceInline(TEXT("\r"), TEXT("\\r"));
		Value.ReplaceInline(TEXT("\n"), TEXT("\\n"));
		return Value;
	}
}

TSharedRef<SWidget> UGlasslineUILayerWidget::RebuildWidget()
{
	if (WidgetTree && !WidgetTree->RootWidget)
	{
		RootPanel = WidgetTree->ConstructWidget<UCanvasPanel>(UCanvasPanel::StaticClass(), TEXT("GlasslineRoot"));
		WidgetTree->RootWidget = RootPanel;

		Browser = WidgetTree->ConstructWidget<UWebBrowser>(UWebBrowser::StaticClass(), TEXT("GlasslineBrowser"));
		Browser->OnConsoleMessage.AddDynamic(this, &UGlasslineUILayerWidget::HandleConsoleMessage);

		UCanvasPanelSlot* BrowserSlot = RootPanel->AddChildToCanvas(Browser);
		BrowserSlot->SetAnchors(FAnchors(0.0f, 0.0f, 1.0f, 1.0f));
		BrowserSlot->SetOffsets(FMargin(0.0f));
	}

	return Super::RebuildWidget();
}

void UGlasslineUILayerWidget::NativeConstruct()
{
	Super::NativeConstruct();
	SetVisibility(ESlateVisibility::HitTestInvisible);
}

void UGlasslineUILayerWidget::LoadGlasslineUrl(const FString& Url)
{
	if (Browser)
	{
		Browser->LoadURL(Url);
	}
}

void UGlasslineUILayerWidget::SendJsonMessage(const FString& Json)
{
	if (!Browser)
	{
		return;
	}

	const FString Script = FString::Printf(
		TEXT("window.Glassline&&window.Glassline.receive(JSON.parse('%s'));"),
		*EscapeJavaScriptString(Json));
	Browser->ExecuteJavascript(Script);
}

void UGlasslineUILayerWidget::HandleConsoleMessage(const FString& Message, const FString& Source, int32 Line)
{
	if (Message.StartsWith(GlasslineConsolePrefix))
	{
		UE_LOG(LogTemp, Log, TEXT("Glassline message: %s"), *Message.RightChop(FCString::Strlen(GlasslineConsolePrefix)));
	}
}
