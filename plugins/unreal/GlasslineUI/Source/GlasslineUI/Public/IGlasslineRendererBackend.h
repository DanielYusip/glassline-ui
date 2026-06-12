#pragma once

#include "CoreMinimal.h"
#include "GlasslineUIRendererTypes.h"

class UTexture;

class GLASSLINEUI_API IGlasslineRendererBackend
{
public:
	virtual ~IGlasslineRendererBackend() = default;

	virtual bool Initialize(const FGlasslineLayerDescriptor& Descriptor) = 0;
	virtual void Shutdown() = 0;
	virtual void Resize(FIntPoint Size) = 0;
	virtual void LoadUrl(const FString& Url) = 0;
	virtual void SendMessage(const FGlasslineMessage& Message) = 0;
	virtual void Tick(float DeltaTime) = 0;
	virtual UTexture* GetTexture() const = 0;
};
